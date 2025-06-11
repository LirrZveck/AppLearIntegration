// src\product\Services\products.service.ts
import { Inject, Injectable, Res } from '@nestjs/common';
import { StockMovementDTO } from '../dtos/order.dto';
import { MessagesService } from 'src/messages/services/messages/messages.service';
import { PendingItemDTO } from '../../movements/dtos/movement.dto';
import { Client } from 'pg';
import { Messageitem } from 'src/messages/models/messagesItem.model';
import { Item, StockMovement, ProductionItem } from '../models/produc.model';
import {
  insertItemQuery,
  insertMovementQuery,
  selectAllItems,
  selectAllMovements,
  insertProductionReport,
  selectProductionReports,
  insertPending,
  selectAllPending as selectAllPendingSql,
  selectCurrentInProductionItem,
  insertInProductionItem,
  deleteInProductionItem,
  updateItemToAvailable,
  insertIntoFinalizados,
} from '../sql/sqlStatements';
import { Message } from 'src/messages/models/messages.model';

interface ProductionReport {
  product_code: string;
  description: string;
  total_produced: number;
  damaged_quantity: number;
  remaining_products: number;
}

@Injectable()
export class ProductService {
  constructor(
    private readonly messages: MessagesService,
    @Inject('postgresConnection') private clientPg: Client,
  ) {}

  async getAllMovements(): Promise<StockMovement[] | Message> {
    return new Promise<StockMovement[] | Message>((resolve, reject) => {
      try {
        const query = `
          SELECT sm.message_id, sm.message_date, sm.message_type, sm.message_user_id, sm.logistics_center,
                 json_agg(i.*) AS items
          FROM stock_movement sm
          LEFT JOIN item i ON sm.message_id = i.stock_movement_id
          GROUP BY sm.message_id, sm.message_date, sm.message_type, sm.message_user_id, sm.logistics_center;
        `;

        this.clientPg.query(query, (err, res) => {
          if (err) {
            reject(
              this.messages.errorExcuteQuery('PostgreSQL', err.toString()),
            );
          }
          console.log('📌 Respuesta de API con `items` incluidos:', res.rows);
          resolve(res.rows);
        });
      } catch (error) {
        reject(this.messages.internalServerError());
      }
    });
  }

  async getItems(): Promise<StockMovement[] | Message> {
    return new Promise<StockMovement[] | Message>((resolve, reject) => {
      try {
        this.clientPg.query(selectAllItems, (err, res) => {
          if (err) {
            reject(this.messages.errorExcuteQuery('Postgrest', err.toString()));
          }
          console.log(res.rows);
          resolve(res.rows);
        });
      } catch (error) {
        reject(this.messages.internalServerError());
      }
    });
  }

  async insertStockMovement(stockMovement: StockMovementDTO): Promise<Message> {
    const client = this.clientPg;
    try {
      await this.clientPg.query('BEGIN');
      const {
        messageID,
        messageDate,
        messageType,
        messageUserID,
        movementOrder,
        items,
        status,
      } = stockMovement;

      await client.query(insertMovementQuery, [
        messageID,
        messageDate,
        messageType,
        messageUserID,
        movementOrder.logisticsCenter,
        status,
      ]);

      for (const item of items) {
        await client.query(insertItemQuery, [
          item.productCode,
          item.lot,
          item.description,
          item.quantity,
          item.expiredDate,
          item.cum,
          item.warehouse,
          messageID,
          true,
        ]);
      }

      await client.query('COMMIT');
      console.log('StockMovement and Items inserted successfully.');
      return this.messages.statusOk(
        'StockMovement and Items inserted successfully.',
      );
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error inserting StockMovement and Items:', error);
      return this.messages.generalError(
        error,
        'Error inserting StockMovement and Items',
      );
    }
  }

  async putItemByCode(
    productCode: string,
    lot: string,
    status: boolean,
  ): Promise<Message> {
    const client = this.clientPg;
    try {
      await client.query('BEGIN');

      if (status === true) {
        const updateQuery = `UPDATE item SET status_prod = $1 WHERE product_code = $2 AND lot = $3`;
        await client.query(updateQuery, [status, productCode, lot]);
        console.log(
          `✅ Estado actualizado a ${status} para ${productCode} - Lote: ${lot}`,
        );
        await client.query('COMMIT');
        return this.messages.statusOk(`Item actualizado correctamente.`);
      } else {
        const selectItemQuery = `SELECT id, product_code, lot, description, quantity, expired_date, cum, warehouse, stock_movement_id, status_prod, created_at FROM item WHERE product_code = $1 AND lot = $2`;
        const result = await client.query(selectItemQuery, [productCode, lot]);

        if (result.rows.length === 0) {
          await client.query('ROLLBACK');
          return this.messages.generalError(
            null,
            'Producto no encontrado en la tabla item para mover.',
          );
        }

        const itemToMove = result.rows[0];
        const pendingItemDto: PendingItemDTO = {
          productCode: itemToMove.product_code,
          lot: itemToMove.lot,
          description: itemToMove.description,
          quantity: Math.floor(itemToMove.quantity),
          expiredDate: new Date(itemToMove.expired_date),
          cum: itemToMove.cum,
          warehouse: itemToMove.warehouse,
          messageId: itemToMove.stock_movement_id,
          status: true,
          createDate: new Date(),
        };

        await this.moveToPendingItem(pendingItemDto);
        console.log(`✅ Producto movido a pending_item: ${productCode}`);

        const deleteItemQuery = `DELETE FROM item WHERE product_code = $1 AND lot = $2`;
        await client.query(deleteItemQuery, [productCode, lot]);
        console.log(`✅ Producto eliminado de item: ${productCode}`);

        await client.query('COMMIT');
        return this.messages.statusOk(
          `Item movido a producción pendiente y eliminado de item.`,
        );
      }
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Error al procesar el ítem ${productCode}`, error);
      return this.messages.generalError(
        error,
        `Error al mover/actualizar el ítem ${productCode}`,
      );
    }
  }

  async getPendingItems(): Promise<Item[]> {
    try {
      const result = await this.clientPg.query(selectAllPendingSql);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo ítems pendientes:', error);
      throw new Error('Error al recuperar ítems de producción pendiente');
    }
  }

  async saveProductionReport(reportData: ProductionReport) {
    if (!reportData?.product_code || !reportData?.description) {
      throw new Error(
        'Datos del reporte incompletos: product_code y description son requeridos',
      );
    }

    if (
      typeof reportData.total_produced !== 'number' ||
      reportData.total_produced < 0
    ) {
      throw new Error('total_produced debe ser un número positivo');
    }

    try {
      const result = await this.clientPg.query(insertProductionReport, [
        reportData.product_code,
        reportData.description,
        reportData.total_produced,
        reportData.damaged_quantity || 0,
        reportData.remaining_products ||
          reportData.total_produced - (reportData.damaged_quantity || 0),
      ]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al guardar reporte: ${error.message}`);
    }
  }

  async getProductionReports() {
    try {
      const result = await this.clientPg.query(selectProductionReports);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo reportes:', error);
      throw new Error('Error al recuperar reportes de producción');
    }
  }

  async moveToPendingItem(pendingItem: PendingItemDTO): Promise<string> {
    try {
      await this.clientPg.query(insertPending, [
        pendingItem.productCode,
        pendingItem.lot,
        pendingItem.description,
        pendingItem.quantity,
        pendingItem.expiredDate,
        pendingItem.cum,
        pendingItem.warehouse,
        pendingItem.messageId,
        pendingItem.status,
        pendingItem.createDate,
      ]);
      return 'Item moved to pending successfully';
    } catch (error) {
      console.error('Error moving to pending:', error);
      throw new Error(`Failed to move item: ${error.message}`);
    }
  }

  async getInProductionItem(): Promise<ProductionItem | null> {
    const client = this.clientPg;
    try {
      const result = await client.query(selectCurrentInProductionItem);
      if (result.rows.length > 0) {
        return result.rows[0];
      }
      return null;
    } catch (error) {
      console.error('❌ Error al obtener el ítem en producción:', error);
      throw new Error('Error al recuperar el ítem en producción.');
    }
  }

  async moveToInicioProduccion(
    productCode: string,
    lot: string,
    source: 'item' | 'pending_item',
  ): Promise<Message> {
    const client = this.clientPg;
    try {
      await client.query('BEGIN');

      let productToMove: any;
      let sourceQuery: string;

      if (source === 'pending_item') {
        sourceQuery = `SELECT * FROM pending_item WHERE product_code = $1 AND lot = $2;`;
      } else {
        sourceQuery = `SELECT * FROM item WHERE product_code = $1 AND lot = $2;`;
      }

      const sourceResult = await client.query(sourceQuery, [productCode, lot]);
      if (sourceResult.rows.length === 0) {
        throw new Error(
          `Producto no encontrado en la tabla de origen '${source}'.`,
        );
      }
      productToMove = sourceResult.rows[0];

      const currentInProductionResult = await client.query(
        selectCurrentInProductionItem,
      );
      if (currentInProductionResult.rows.length > 0) {
        const oldProductInProduction: ProductionItem =
          currentInProductionResult.rows[0];
        await client.query(deleteInProductionItem, [oldProductInProduction.id]);

        if (oldProductInProduction.originalSourceTable === 'pending_item') {
          await client.query(insertPending, [
            oldProductInProduction.productCode,
            oldProductInProduction.lot,
            oldProductInProduction.description,
            oldProductInProduction.quantity,
            oldProductInProduction.expiredDate,
            oldProductInProduction.cum,
            oldProductInProduction.warehouse,
            oldProductInProduction.messageId,
            true,
            oldProductInProduction.createdate,
          ]);
        } else if (oldProductInProduction.originalSourceTable === 'item') {
          await client.query(updateItemToAvailable, [
            oldProductInProduction.productCode,
            oldProductInProduction.lot,
          ]);
        }
      }

      await client.query(insertInProductionItem, [
        productToMove.product_code,
        productToMove.lot,
        productToMove.description,
        parseInt(productToMove.quantity, 10),
        productToMove.expired_date,
        productToMove.cum,
        productToMove.warehouse,
        productToMove.message_id || productToMove.stock_movement_id,
        true,
        new Date(),
        source,
      ]);

      let deleteQuery: string;
      if (source === 'pending_item') {
        deleteQuery = `DELETE FROM pending_item WHERE product_code = $1 AND lot = $2;`;
      } else {
        deleteQuery = `DELETE FROM item WHERE product_code = $1 AND lot = $2;`;
      }
      await client.query(deleteQuery, [productCode, lot]);

      await client.query('COMMIT');
      return this.messages.statusOk(
        `Producto ${productCode} movido a producción activa.`,
      );
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Error al mover producto a 'production_item':`, error);
      return this.messages.generalError(error, `Error al iniciar producción.`);
    }
  }

  // --- FUNCIÓN ACTUALIZADA CON LA LÓGICA DE NEGOCIO CORREGIDA ---
  async finalizeProduction(data: {
    productCode: string;
    lot: string;
    originalQuantity: number;
    netQuantity: number;
    damagedQuantity: number;
  }): Promise<Message> {
    const client = this.clientPg;
    try {
      await client.query('BEGIN');

      const itemEnProduccionResult = await client.query(
        `SELECT * FROM production_item WHERE product_code = $1 AND lot = $2 AND status = TRUE`,
        [data.productCode, data.lot],
      );

      if (itemEnProduccionResult.rows.length === 0) {
        throw new Error(
          'No se encontró el producto en producción activa para finalizar.',
        );
      }
      const itemData = itemEnProduccionResult.rows[0];

      await client.query(`DELETE FROM production_item WHERE id = $1`, [
        itemData.id,
      ]);

      if (data.netQuantity > 0) {
        // Si quedan unidades netas, el lote vuelve a pendientes.
        console.log(
          `⚠️ Producción con remanente (${data.netQuantity} unidades). Moviendo a produccionpendiente...`,
        );
        await this.moveToPendingItem({
          productCode: itemData.product_code,
          lot: itemData.lot,
          description: itemData.description,
          quantity: data.netQuantity,
          expiredDate: new Date(itemData.expired_date),
          cum: itemData.cum,
          warehouse: itemData.warehouse,
          messageId: itemData.message_id,
          status: true,
          createDate: new Date(),
        });
      } else {
        // Si la producción neta es 0, el lote se considera finalizado.
        console.log(
          `✅ Producción neta es 0. Moviendo a productos_finalizados...`,
        );
        await client.query(insertIntoFinalizados, [
          itemData.product_code,
          itemData.lot,
          itemData.description,
          data.originalQuantity,
          data.netQuantity,
          data.damagedQuantity,
          itemData.expired_date,
          itemData.cum,
          itemData.warehouse,
        ]);
      }

      await client.query('COMMIT');
      return this.messages.statusOk(
        'Producción finalizada y registrada correctamente.',
      );
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error al finalizar la producción:', error);
      return this.messages.generalError(
        error,
        'Error al finalizar la producción.',
      );
    }
  }
}
