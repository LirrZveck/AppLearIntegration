import { Inject, Injectable } from '@nestjs/common';
import { StockMovementDTO } from '../dtos/order.dto';
import { MessagesService } from 'src/messages/services/messages/messages.service';
import { PendingItemDTO } from '../../movements/dtos/movement.dto';
import { Client } from 'pg';
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
  updateItemQuantityAndStatus,
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
          if (err)
            reject(
              this.messages.errorExcuteQuery('PostgreSQL', err.toString()),
            );
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
          if (err)
            reject(this.messages.errorExcuteQuery('Postgrest', err.toString()));
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
      await client.query('BEGIN');
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
      return this.messages.statusOk(
        'StockMovement and Items inserted successfully.',
      );
    } catch (error) {
      await client.query('ROLLBACK');
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
        await client.query('COMMIT');
        return this.messages.statusOk(`Item actualizado correctamente.`);
      } else {
        const selectItemQuery = `SELECT * FROM item WHERE product_code = $1 AND lot = $2`;
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
        const deleteItemQuery = `DELETE FROM item WHERE product_code = $1 AND lot = $2`;
        await client.query(deleteItemQuery, [productCode, lot]);
        await client.query('COMMIT');
        return this.messages.statusOk(
          `Item movido a producción pendiente y eliminado de item.`,
        );
      }
    } catch (error) {
      await client.query('ROLLBACK');
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
      throw new Error('Error al recuperar ítems de producción pendiente');
    }
  }

  async saveProductionReport(reportData: ProductionReport) {
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
      throw new Error(`Failed to move item: ${error.message}`);
    }
  }

  async getInProductionItem(): Promise<ProductionItem | null> {
    const client = this.clientPg;
    try {
      const result = await client.query(selectCurrentInProductionItem);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
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
      const sourceQuery =
        source === 'pending_item'
          ? `SELECT * FROM pending_item WHERE product_code = $1 AND lot = $2;`
          : `SELECT * FROM item WHERE product_code = $1 AND lot = $2;`;

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
        // Aquí iría la lógica para devolver el 'oldProductInProduction' a su origen si es necesario
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

      if (source === 'pending_item') {
        const deleteQuery = `DELETE FROM pending_item WHERE product_code = $1 AND lot = $2;`;
        await client.query(deleteQuery, [productCode, lot]);
      } else {
        const updateQuery = `UPDATE item SET status_prod = false WHERE product_code = $1 AND lot = $2;`;
        await client.query(updateQuery, [productCode, lot]);
        console.log(
          `✅ Ítem ${productCode} marcado como no disponible (en producción).`,
        );
      }

      await client.query('COMMIT');
      return this.messages.statusOk(
        `Producto ${productCode} movido a producción activa.`,
      );
    } catch (error) {
      await client.query('ROLLBACK');
      return this.messages.generalError(error, `Error al iniciar producción.`);
    }
  }

  async finalizeProduction(data: {
    productCode: string;
    lot: string;
    originalQuantity: number;
    quantityToProcess: number;
    damagedQuantity: number;
    pendingQuantity: number;
  }): Promise<Message> {
    const client = this.clientPg;
    try {
      await client.query('BEGIN');

      const itemEnProduccionResult = await client.query(
        `SELECT * FROM production_item WHERE product_code = $1 AND lot = $2`,
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

      const initialRemainder = data.originalQuantity - data.quantityToProcess;
      const totalRemainder = initialRemainder + data.pendingQuantity;
      const netProduction =
        data.quantityToProcess - data.damagedQuantity - data.pendingQuantity;

      if (totalRemainder > 0) {
        if (itemData.original_source_table === 'item') {
          await client.query(updateItemQuantityAndStatus, [
            totalRemainder,
            itemData.product_code,
            itemData.lot,
          ]);
        } else {
          await this.moveToPendingItem({
            productCode: itemData.product_code,
            lot: itemData.lot,
            description: itemData.description,
            quantity: totalRemainder,
            expiredDate: new Date(itemData.expired_date),
            cum: itemData.cum,
            warehouse: itemData.warehouse,
            messageId: itemData.message_id,
            status: true,
            createDate: new Date(),
          });
        }
      } else {
        if (itemData.original_source_table === 'item') {
          console.log(
            `✅ Lote finalizado. Moviendo a 'productos_finalizados'.`,
          );
          await client.query(insertIntoFinalizados, [
            itemData.product_code,
            itemData.lot,
            itemData.description,
            data.originalQuantity,
            netProduction,
            data.damagedQuantity,
            itemData.expired_date,
            itemData.cum,
            itemData.warehouse,
          ]);

          console.log(`🗑️ Eliminando lote consumido de la tabla 'item'.`);
          const deleteQuery = `DELETE FROM item WHERE product_code = $1 AND lot = $2;`;
          await client.query(deleteQuery, [data.productCode, data.lot]);
        }
      }

      if (data.damagedQuantity > 0) {
        await this.moveToPendingItem({
          productCode: itemData.product_code,
          lot: itemData.lot,
          description: `${itemData.description} (DAÑADO)`,
          quantity: data.damagedQuantity,
          expiredDate: new Date(itemData.expired_date),
          cum: itemData.cum,
          warehouse: itemData.warehouse,
          messageId: itemData.message_id,
          status: true,
          createDate: new Date(),
        });
      }

      await client.query(insertProductionReport, [
        itemData.product_code,
        itemData.description,
        netProduction,
        data.damagedQuantity,
        totalRemainder,
      ]);

      await client.query('COMMIT');
      return this.messages.statusOk(
        'Producción finalizada. Inventario y reportes actualizados.',
      );
    } catch (error) {
      await client.query('ROLLBACK');
      return this.messages.generalError(
        error,
        'Error al finalizar la producción.',
      );
    }
  }
}
