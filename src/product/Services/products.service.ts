import { Inject, Injectable, Res } from '@nestjs/common';
import { StockMovementDTO } from '../dtos/order.dto';
import { MessagesService } from 'src/messages/services/messages/messages.service';

//Interno
import { Client } from 'pg';
import { Messageitem } from 'src/messages/models/messagesItem.model';
import { Item, StockMovement } from '../models/produc.model';
import {
  insertItemQuery,
  insertMovementQuery,
  selectAllItems,
  selectAllMovements,
  selectItemsActive,
  updateItemQuery,
} from '../sql/sqlStatements';
import { Message } from 'src/messages/models/messages.model';

@Injectable()
export class ProductService {
  constructor(
    private readonly messages: MessagesService,
    @Inject('postgresConnection') private clientPg: Client,
  ) {}

  //-------------------GET LIST OF ALL ITEMS----------------------------//
  async getAllMovements() {
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

  async getItems() {
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
    //console.log(orderExample)
  }

  async getItemsActive() {
    return new Promise<StockMovement[] | Message>((resolve, reject) => {
      try {
        this.clientPg.query(selectItemsActive, (err, res) => {
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
    //console.log(orderExample)
  }

  async insertStockMovement(stockMovement: StockMovementDTO): Promise<Message> {
    const client = this.clientPg;
    //console.log(StockMovement)
    try {
      // Inicia una transacción
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
          item.warehouse, //"H159",
          messageID, // Relaciona el item con el movimiento
          true,
        ]);
      }

      // Confirma la transacción
      await client.query('COMMIT');
      console.log('StockMovement and Items inserted successfully.');
      return this.messages.statusOk('StockMovement and Items inserted successfully.');
    } catch (error) {
      // Revertir la transacción en caso de error
      await client.query('ROLLBACK');
      console.error('Error inserting StockMovement and Items:', error);
      return this.messages.generalError(
        error,
        'Error inserting StockMovement and Items',
      );
      //throw error;
    }
  }


  async putItemByCode( productCode: string, lot: string, status: boolean){
    const client = this.clientPg;
    try{
      // Inicia una transacción
      await this.clientPg.query('BEGIN');


      await client.query(updateItemQuery, [
        status,
        productCode,
        lot
      ]);
      // Confirma la transacción
      await client.query('COMMIT');
      console.log('Update Item successfully.');
      return this.messages.statusOk('Update Item successfully.');
    }catch(error){
      await client.query('ROLLBACK');
      console.error(`Error updating Items ${productCode}`, error);
      return this.messages.generalError(
        error,
        `Error updating Items ${productCode}`,
      );
    }finally {

    }
  }
}
