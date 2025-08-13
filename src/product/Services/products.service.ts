import { forwardRef, Inject, Injectable } from '@nestjs/common';
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
  selectAllItemsProduction,
  truncateProductionItem,
} from '../sql/sqlStatements';
import { Message } from 'src/messages/models/messages.model';
import { MovementService } from 'src/movements/services/movement.service';
import { StockMovementDTO } from '../dtos/order.dto';
import { BiqService } from './biq.service';
import { selectStockMovementByStockMovementId } from 'src/movements/sql/sqlMovementStatements';

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
    @Inject(forwardRef(() => BiqService))
    private readonly biqService: BiqService,
    @Inject('postgresConnection') private clientPg: Client,
  ) {}

  async getAllMovements(): Promise<StockMovement[] | Message> {
    return new Promise<StockMovement[] | Message>((resolve, reject) => {
      try {
        this.clientPg.query(selectAllMovements, (err, res) => {
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


    async getItemsProduction(): Promise<Item[] | Message> {
    return new Promise<Item[] | Message>((resolve, reject) => {
      try {
        this.clientPg.query(selectAllItemsProduction, (err, res) => {
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

async getMovementsById(id: String): Promise<any> {
    return new Promise<StockMovement>((resolve, reject) => {
      try {
        this.clientPg.query(selectAllMovements, (err, res) => {
          if (err)
            reject(
              this.messages.errorExcuteQuery('PostgreSQL', err.toString()),
            );
          resolve(res.rows[0]);
        });
      } catch (error) {
        reject(this.messages.internalServerError());
      }
    });
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

      const quantityPendingItems = await this.getItemsProduction()

      if (Array.isArray(quantityPendingItems)) {

          if (quantityPendingItems.length > 0) {
            try {
              await client.query(truncateProductionItem)
              
            } catch (error) {
              console.log (`Error al tratar de ejecutar la limpieza de production item ${error}`)
            }
            
          }
          else{
            console.log (`La consulta de production item no se ha logrado ejecutar`)
          }
          
        }
      console.log(
        `moviendo a produccion de ${source} el producto ${productCode}`,
      );
      await client.query('BEGIN');
      let productToMove: any;
      const sourceQuery =
        source === 'pending_item' ? selectFromPendingItems : selectFromItem;

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

      await client.query('COMMIT');
      return this.messages.statusOk(
        `Producto ${productCode} movido a producción activa.`,
      );
    } catch (error) {
      await client.query('ROLLBACK');
      return this.messages.generalError(error, `Error al iniciar producción.`);
    }
  }

  async finalizeProduction(
    productCode: string, // Aca estoy recibiendo los datos que envias
    lot: string,
    originalQuantity: number,
    quantityToProcess: number,
    damagedQuantity: number,
    pendingQuantity: number,
  ): Promise<Message> {
    const client = this.clientPg;
    try {
      console.log(
        `🎬 Finalizando con la produccion de: ${productCode} - Lote: ${lot}`,
      );
      await client.query('BEGIN');
      const itemProductionResult = await client.query(
        selectProdItemByCodeAndLot,
        [productCode, lot],
      );

      if (itemProductionResult.rows.length === 0) {
        return this.messages.generalError(
          new Error(),
          'No se encontró el producto en producción activa para finalizar.',
        );
      }

      const itemData = itemProductionResult.rows[0];
      // console.log (`Item obtenido de production item: ${itemData} ` )
      // Construccion de las cantidades para enviar a cada tabla
      const totalRemainder = originalQuantity - quantityToProcess; // 350    -  150
      const netProduction =
        quantityToProcess - damagedQuantity - pendingQuantity;
      console.log(
        `🎬 Enviando la informacion a las tablas de pendientes : ${pendingQuantity} produccion neta: ${netProduction} productos faileds ${damagedQuantity} cantidad restante ${totalRemainder}`,
      );

      //Actualizamos la tabla item o pending_item dependiendo si el valor llega o aun hay stock
      switch (itemData.original_source_table) {
        case 'item':
          if (totalRemainder === 0) {
            console.log(
              `La cantidad original y la procesada es igual... realizando la actualizacion de las cantidades de la  tabla item a ${totalRemainder} y estado a false`,
            );
            await client.query(updateItemQuantityAndStatus, [
              totalRemainder,
              false,
              itemData.product_code,
              itemData.lot,
              itemData.message_id,
            ]);
            await client.query('COMMIT');
          } else {
            console.log(
              `La cantidad original y la procesada no es igual... realizando la actualizacion de las cantidades de la tabla item a ${totalRemainder}`,
            );
            await client.query(updateItemQuantityAndStatus, [
              totalRemainder,
              true,
              itemData.product_code,
              itemData.lot,
              itemData.message_id,
            ]);
            await client.query('COMMIT');
          }
          break;
        case 'pending_item':
          if (totalRemainder === 0) {
            await client.query(updatePendingItemQuantityAndStatus, [
              totalRemainder,
              false,
              itemData.product_code,
              itemData.lot,
              itemData.message_id,
            ]);
            await client.query('COMMIT');
          } else {
            try {
              await client.query(updatePendingItemQuantityAndStatus, [
                totalRemainder,
                true,
                itemData.product_code,
                itemData.lot,
                itemData.message_id,
              ]);
            } catch (error) {
              console.log(
                `Error al tratar de actualizar el articulo de item a 0 ${error}`,
              );
            }
            await client.query('COMMIT');
          }
          break;
      }

      //Insertar los items da;ados y los producidos

      if (pendingQuantity > 0) {
        const pendingItem: Item = {
          productCode: itemData.product_code,
          lot: itemData.lot,
          description: itemData.description,
          quantity: pendingQuantity,
          expiredDate: itemData.expired_date,
          cum: itemData.cum,
          warehouse: itemData.warehouse,
          messageId: itemData.message_id,
          status: true,
          createDate: itemData.createdate,
        };
        await this.movementService.insertPendingItem(pendingItem);
      }

      if (damagedQuantity > 0) {
        const failedItem: Item = {
          productCode: itemData.product_code,
          lot: itemData.lot,
          description: itemData.description,
          quantity: damagedQuantity,
          expiredDate: itemData.expired_date,
          cum: itemData.cum,
          warehouse: itemData.warehouse,
          messageId: itemData.message_id,
          status: true,
          createDate: itemData.createdate,
        };
        await this.movementService.insertBrokenItem(failedItem);
        //Consumir la api para insertar el item dañado a el servicio de BIQ
        await this.biqService.postStockMovement(failedItem, 'HM169');
      }

      if (netProduction > 0) {
        const finishedItem: Item = {
          productCode: itemData.product_code,
          lot: itemData.lot,
          description: itemData.description,
          quantity: netProduction,
          expiredDate: itemData.expired_date,
          cum: itemData.cum,
          warehouse: itemData.warehouse,
          messageId: itemData.message_id,
          status: true,
          createDate: itemData.createdate,
        };
        await this.movementService.insertProductionItem(finishedItem);
        //Consumir la api para insertar el item producido a el servicio de BIQ
        await this.biqService.postStockMovement(finishedItem, 'HM158');
      }

      await client.query(insertProductionReport, [
        itemData.product_code,
        itemData.description,
        netProduction,
        damagedQuantity,
        totalRemainder,
      ]);

      console.log(
        `Eliminando de la producicon : ${productCode} - Lote: ${lot}`,
      );

      try {
        await client.query(deleteInProductionItem, [itemData.id]);
        await client.query('COMMIT');
      } catch (error) {
        console.log(
          `Error al intentar eliminar el item de produccion ${itemData.id}`,
        );
      }

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
