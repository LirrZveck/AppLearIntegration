import { Inject, Injectable, Res } from '@nestjs/common';
import { StockMovementDTO  } from '../dtos/order.dto';
import { MessagesService } from 'src/messages/services/messages/messages.service';

//Interno
import { Client } from 'pg';
import { Messageitem } from 'src/messages/models/messagesItem.model';
import { StockMovement } from '../models/produc.model';
import { insertItemQuery, insertMovementQuery} from '../sql/sqlStatements'

// let orderExample: OrderListBIQDto = {
//   messageID: 'MSG123456',
//   messageDate: '2024-11-21',
//   messageType: 'OrderCreation',
//   messageUserID: 'User7890',
//   movementOrder: {
//     LogisticsCenter: 'CentralWarehouse-001',
//   },
//   items: [
//     {
//       productCode: 'PROD001',
//       lot: 'LOT123',
//       quantity: 10,
//       expiredDate: new Date('2024-12-31'),
//       cum: 'CUM12345',
//       warehouse: 'WH001',
//     },
//     {
//       productCode: 'PROD002',
//       lot: 'LOT124',
//       quantity: 20,
//       expiredDate: new Date('2025-01-15'),
//       cum: 'CUM12346',
//       warehouse: 'WH002',
//     },
//     {
//       productCode: 'PROD003',
//       lot: 'LOT125',
//       quantity: 15,
//       expiredDate: new Date('2024-11-30'),
//       cum: 'CUM12347',
//       warehouse: 'WH003',
//     },
//     {
//       productCode: 'PROD004',
//       lot: 'LOT126',
//       quantity: 25,
//       expiredDate: new Date('2025-02-10'),
//       cum: 'CUM12348',
//       warehouse: 'WH004',
//     },
//     {
//       productCode: 'PROD005',
//       lot: 'LOT127',
//       quantity: 30,
//       expiredDate: new Date('2025-03-05'),
//       cum: 'CUM12349',
//       warehouse: 'WH005',
//     },
//     {
//       productCode: 'PROD006',
//       lot: 'LOT128',
//       quantity: 40,
//       expiredDate: new Date('2024-12-20'),
//       cum: 'CUM12350',
//       warehouse: 'WH006',
//     },
//   ],
// };

@Injectable()
export class ProductService {
  constructor(
    private readonly messages: MessagesService,
    @Inject('postgresConnection') private clientPg: Client,
  ) {}

  insertProducstBIQ(product: StockMovement) {
    
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

    this.clientPg.query('');
  }
  
  async getProductsBIQ() {
    return new Promise<StockMovement[]>((resolve,reject)=>{
      try {
        const apiUrl = process.env.API_URL;
        if (!apiUrl) {
          reject(new Error(
            'La URL de la API no está definida en las variables de entorno.',
          )) 
        }
        this.clientPg.query('SELECT * FROM public.products', (err, res)=>{
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
  async postProductsBIQ(StockMovement: StockMovement): Promise<void> {
    const client = this.clientPg;

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
      } = StockMovement;


    for (const item of items) {
      await client.query(insertItemQuery, [
        item.productCode,
        item.lot,
        item.description,
        item.quantity,
        item.expiredDate,
        item.cum,
        item.warehouse,
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
