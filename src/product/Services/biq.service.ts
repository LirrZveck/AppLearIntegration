import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Message } from 'src/messages/models/messages.model';
import { Item, StockMovement } from '../models/produc.model';
import { MessagesService } from 'src/messages/services/messages/messages.service';
import { Client } from 'pg';
import { ProductService } from './products.service';
import { BiqItem, BiqStockMovement } from '../models/biq.model';
import axios from 'axios';

@Injectable()
export class BiqService {
    constructor( @Inject(forwardRef(() => ProductService))
                private readonly productService: ProductService,
                private readonly messages: MessagesService
    ) {}

    async postStockMovement(item : Item, warehouse: string): Promise< Message|StockMovement[]> {
        return new Promise<Message>(async (resolve, reject) => {
          try {
            //Consultar el stock movement
            const stockMovement: StockMovement[] | Message = await this.productService.getMovementsById(item.messageId);


            //Validamos si la variable stockMovement es un array
            if (!Array.isArray(stockMovement)) {
              console.log('Error: stockMovement is not an array');
              reject(this.messages.generalError(null, 'Stock movement not found'));
              return;
            }
            console.log('Stock movement found:', stockMovement);
            const stockMovementBiq: BiqStockMovement = {
              messageID: stockMovement[0].messageID,
              messageDate: stockMovement[0].messageDate,
              messageType: stockMovement[0].messageType,
              messageUserID: stockMovement[0].messageUserID,
              movementOrder: {
                logisticsCenter: stockMovement[0].movementOrder.logisticsCenter
              },
              items: [],
            };
            // crear la instancia de itemBiq nueva
            const itemBiq: BiqItem = {
              itemCode: item.productCode,
              batch: item.lot,
              quantity: item.quantity,
              plus_movement: '', // que dato debe ir aca?
              minus_movement: '',
              expDate: item.expiredDate,
              warehouseCode: warehouse,
              reference_order_number: ''
            };
            //Agregar el itemBiq al array de items
            stockMovementBiq.items.push(itemBiq);
            console.log('Stock movement BIQ:', stockMovementBiq);
            //Enviar el objeto a la api de BIQ por post y axios
            try {
              const response = await axios.post('http://192.168.5.143/MAPP_API/mappapi/api/StockMov', stockMovementBiq);
              resolve(this.messages.statusOk('Stock movement sent to BIQ successfully.'));
            } catch (error) {
              reject(this.messages.generalError(error, 'Error sending stock movement to BIQ.'));
            }

          } catch (error) {
            reject(this.messages.generalError(error, 'Error processing stock movement for BIQ.'));
          }
        });
      }

      

}
