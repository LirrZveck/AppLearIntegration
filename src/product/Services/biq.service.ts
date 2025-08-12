import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Message } from 'src/messages/models/messages.model';
import { Item } from '../models/produc.model';
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

    async postStockMovement(item : Item, warehouse: string): Promise<Message> {
        return new Promise<Message>(async (resolve, reject) => {
          try {
            //Consultar el stock movement
            const stockMovement = await this.productService.getStockMovementById(item.messageId);
            if (!stockMovement) {
              reject(this.messages.generalError(null, 'Stock movement not found'));
            }
            //crear una instancia de stockMovementBiq nueva y vacia
            const stockMovementBiq: BiqStockMovement = {
              messageID: stockMovement.messageID,
              messageDate: stockMovement.messageDate,
              messageType: stockMovement.messageType,
              messageUserID: stockMovement.messageUserID,
              movementOrder: {
                logisticsCenter: stockMovement.movementOrder.logisticsCenter
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
