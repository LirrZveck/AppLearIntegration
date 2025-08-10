import { Inject, Injectable } from '@nestjs/common';
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
  selectFromPendingItems,
  selectFromItem,
  updatePendingItemToFalse,
  updateItemToFalse,
  selectProdItemByCodeAndLot,
  updatePendingItemQuantityAndStatus,
} from '../sql/sqlStatements';
import { Message } from 'src/messages/models/messages.model';
import { MovementService } from 'src/movements/services/movement.service';
import { StockMovementDTO } from '../dtos/order.dto';

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
    private readonly movementService: MovementService,    
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
          ? selectFromPendingItems
          : selectFromItem;  

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




      //Se realiza la validacion de las tablas Pending e Items para Validar la cantidad que esta 

      if (source === 'pending_item') {       
        const updateQuery = updatePendingItemToFalse;
        await client.query(updateQuery, [productCode, lot]);
      } else {
       
        const updateQuery = updateItemToFalse; 
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

  async finalizeProduction(item: ProductionItem,  
    originalQuantity: number,
    quantityToProcess: number,
    damagedQuantity: number,
    pendingQuantity: number): Promise<Message> {
    const client = this.clientPg;
    try {

      await client.query('BEGIN');

      const itemProductionResult = await client.query(
        selectProdItemByCodeAndLot,
        [item.productCode, item.lot],
      );

      if (itemProductionResult.rows.length === 0) {
        throw new Error(
          'No se encontró el producto en producción activa para finalizar.',
        );
      }
      const itemData = itemProductionResult.rows[0];

      await client.query(deleteInProductionItem, [  
        itemData.id,
      ]);

      // Construccion de las cantidades para enviar a cada tabla

      const totalRemainder = originalQuantity - quantityToProcess;
      const netProduction =  quantityToProcess - damagedQuantity - pendingQuantity;

      //Actualizamos la tabla item o pending_item dependiendo si el valor llega o aun hay stock
      switch (itemData.original_source_table) {
        case "item":
        if (totalRemainder===0) {
            await client.query(updateItemQuantityAndStatus, [
            totalRemainder,
            false,
            itemData.product_code,
            itemData.lot,
          ]);
        }
        else{
            await client.query(updateItemQuantityAndStatus, [
            totalRemainder,
            true,
            itemData.product_code,
            itemData.lot,
          ]);
        }
          break;
        case "pending_item":
          if (totalRemainder===0) {
            await client.query(updatePendingItemQuantityAndStatus, [
            totalRemainder,
            false,
            itemData.product_code,
            itemData.lot,
          ]);
        }
        else{
            await client.query(updatePendingItemQuantityAndStatus, [
            totalRemainder,
            true,
            itemData.product_code,
            itemData.lot,
          ]);
        }
          break;
      }

      //Insertar los items da;ados y los producidos
          const pendingItem: Item = {
            ...itemData
          }
          pendingItem.quantity = pendingQuantity;
          this.movementService.insertPendingItem(pendingItem)

          const finishedItem: Item = {
            ...itemData
          }
          finishedItem.quantity = netProduction;
          this.movementService.insertProductionItem(finishedItem);

          const failedItem: Item = {
            ...itemData
          }
          failedItem.quantity = damagedQuantity;
          this.movementService.insertBrokenItem(failedItem)

        await client.query(insertProductionReport, [
        itemData.product_code,
        itemData.description,
        netProduction,
        damagedQuantity,
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
