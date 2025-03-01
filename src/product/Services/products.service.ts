import { Inject, Injectable, Res } from '@nestjs/common';
import { StockMovementDTO  } from '../dtos/order.dto';
import { MessagesService } from 'src/messages/services/messages/messages.service';

//Interno
import { Client } from 'pg';
import { Messageitem } from 'src/messages/models/messagesItem.model';
import { StockMovement } from '../models/produc.model';
import { insertItemQuery, insertMovementQuery, selectAllItems, selectAllMovements} from '../sql/sqlStatements'

@Injectable()
export class ProductService {
  constructor(
    private readonly messages: MessagesService,
    @Inject('postgresConnection') private clientPg: Client,
  ) {}

  //-------------------GET LIST OF ALL ITEMS----------------------------//
  async getAllMovements() {
    return new Promise<StockMovement[]>((resolve,reject)=>{
      try {
       this.clientPg.query(selectAllMovements, (err, res)=>{
          if(err){
            reject (err)
          }
          console.log(res.rows)
          resolve (res.rows);
        });
      } catch (error) {
      }
     

    })
    //console.log(orderExample)
  }


  async getItems() {
    return new Promise<StockMovement[]>((resolve,reject)=>{
      try {
        this.clientPg.query(selectAllItems, (err, res)=>{
          if(err){
            reject (err)
          }
          console.log(res.rows)
          resolve (res.rows);
        });
      } catch (error) {
        reject(error)
      }

    })
    //console.log(orderExample)
  }

  
  insertStockMovement(product: StockMovement) {
    
    const message: Messageitem = {
      messageId: product.messageID,
      messageDate: product.messageDate,
      messageType: product.messageType,
      messageUserID: product.messageUserID,
      movementOrder: {
        logisticsCenter: product.movementOrder.logisticsCenter
      }, 
      status: 'created'
    };

    this.clientPg.query(insertMovementQuery);
    this.insertItems(product);

  }
  

  async insertItems(stockMovement: StockMovement): Promise<void> {
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
      } = stockMovement;

      await client.query(insertMovementQuery, [
        messageID,
        messageDate,
        messageType,
        messageUserID,
        movementOrder.logisticsCenter,
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
        //"H159",
        messageID, // Relaciona el item con el movimiento
      ]);
    }

      // Confirma la transacción
      await client.query('COMMIT');
      console.log('StockMovement and Items inserted successfully.');
    } catch (error) {
      // Revertir la transacción en caso de error
      await client.query('ROLLBACK');
      console.error('Error inserting StockMovement and Items:', error);
      throw error;
    }
    
  }
}
