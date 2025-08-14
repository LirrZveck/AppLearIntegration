import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Message } from 'src/messages/models/messages.model';
import { Item, StockMovement } from '../models/produc.model';
import { MessagesService } from 'src/messages/services/messages/messages.service';
import { envs } from './../../config';
import { ProductService } from './products.service';
import { BiqItem, BiqStockMovement } from '../models/biq.model';
import axios from 'axios';

@Injectable()
export class BiqService {
  constructor(
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
    private readonly messages: MessagesService,
  ) {}

  async postStockMovement(
    item: Item,
    warehouse: string,
  ): Promise<BiqStockMovement | Message> {
    return new Promise<BiqStockMovement | Message>(async (resolve, reject) => {
      console.log(`Intentando enviar ${item} a la bodega ${warehouse} de BIQ`);
      try {
        //Consultar el stock movement
        const stockMovement =
          await this.productService.getMovementsById(item.messageId);
        //Validamos si la variable stockMovement es un array
        console.log('Stock movement found:', stockMovement);
        console.log(`Propiedades de stockMovement`, stockMovement.message_id)

        const stockMovementBiq = new BiqStockMovement();
        stockMovementBiq.messageID = stockMovement.message_id;
        stockMovementBiq.messageDate = stockMovement.message_date;
        stockMovementBiq.messageType = stockMovement.message_type;
        stockMovementBiq.messageUserID = stockMovement.message_user_id;
        stockMovementBiq.movementOrder = {"logisticsCenter":stockMovement.logistics_center};
        const itemBiq = new BiqItem();
        itemBiq.batch = item.lot;
        itemBiq.itemCode = item.productCode;
        itemBiq.quantity = item.quantity;
        itemBiq.plus_movement = '';
        itemBiq.minus_movement = '';
        itemBiq.expDate = item.expiredDate;
        itemBiq.warehouseCode = warehouse;
        itemBiq.reference_order_number = '';
        stockMovementBiq.items = [{
          batch: itemBiq.batch,
          itemCode: itemBiq.itemCode,
          quantity: itemBiq.quantity,
          plus_movement: itemBiq.plus_movement,
          minus_movement: itemBiq.minus_movement,
          expDate: itemBiq.expDate,
          warehouseCode: itemBiq.warehouseCode,
          reference_order_number: itemBiq.reference_order_number,
        }];
        try {
          console.log('Prepared stock movement for BIQ:', stockMovementBiq);
          const response = await axios.post(
            `${envs.biqUrl}/StockMov`,
            stockMovement,
          );
          resolve(this.messages.statusOk('Stock movement sent to BIQ'));
        } catch (error) {
          console.log('Error sending stock movement to BIQ:', error);
          reject(
            this.messages.generalError(
              error,
              'Error sending stock movement to BIQ.',
            ),
          );
        }
      } catch (error) {
        reject(
          this.messages.generalError(
            error,
            'Error processing stock movement for BIQ.',
          ),
        );
      }
    });
  }
}
