import { Inject, Injectable } from '@nestjs/common';
import { StockMovement } from 'src/product/models/produc.model';
import { HttpService } from '@nestjs/axios';

import {
  PendingItem,
  ProductionItem,
} from '../models/movements.model';
import { Message } from 'src/messages/models/messages.model';
import { MessagesService } from 'src/messages/services/messages/messages.service';
import { Client } from 'pg';
import {
  insertPending,
  insertProduction,
  selectAllfailed,
  selectAllPending,
  selectAllProduction,
} from '../sql/sqlMovementStatements';
import { FailedItemsDto, PendingItemDTO, ProductionItemDTO } from '../dtos/movement.dto';

@Injectable()
export class MovementService {
  constructor(
    private readonly httpService: HttpService,
    private readonly messages: MessagesService,
    @Inject('postgresConnection') private clientPg: Client,
  ) {}

  async selectProductionItems(): Promise<ProductionItem[]> {
    return new Promise<ProductionItem[]>((resolve, reject) => {
      try {
        this.clientPg.query(selectAllProduction, (err, res) => {
          if (err) {
            reject(err);
          }
          console.log(res.rows);
          resolve(res.rows);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async selectPendingItems(): Promise<ProductionItem[]> {
    return new Promise<ProductionItem[]>((resolve, reject) => {
      try {
        this.clientPg.query(selectAllPending, (err, res) => {
          if (err) {
            reject(err);
          }
          console.log(res.rows);
          resolve(res.rows);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  async selectFailedItems(): Promise<ProductionItem[]> {
    return new Promise<ProductionItem[]>((resolve, reject) => {
      try {
        this.clientPg.query(selectAllfailed, (err, res) => {
          if (err) {
            reject(err);
          }
          console.log(res.rows);
          resolve(res.rows);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async insertProductionItem(productionItem: ProductionItem): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      const client = this.clientPg;
      try {
        // Inicia una transacción
        await this.clientPg.query('BEGIN');

        
        const {
          productCode,
          lot,
          description,
          quantity,
          expiredDate,
          cum,
          warehouse,
          messageId,
          status,
          createDate,
        } = productionItem;

        console.log(productionItem)
        await client.query(insertProduction, [
          productCode,
          lot,
          description,
          quantity,
          expiredDate,
          cum,
          warehouse,
          messageId,
          status,
          createDate
        ]);

        // Confirma la transacción
        await client.query('COMMIT');
        resolve('Production inserted successfully.');
      } catch (error) {
        // Revertir la transacción en caso de error
        await client.query('ROLLBACK');
        reject('Error inserting Production Item:' + error);
      }
    });
  }

  async insertPendingItem(pendingItem: PendingItemDTO): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      const client = this.clientPg;
      try {
        // Inicia una transacción
        await this.clientPg.query('BEGIN');

        const {
          productCode,
          lot,
          description,
          quantity,
          expiredDate,
          cum,
          warehouse,
          messageId,
          status,
          createDate
        } = pendingItem;

        await client.query(insertPending, [
          productCode,
          lot,
          description,
          quantity,
          expiredDate,
          cum,
          warehouse,
          messageId,
          status,
          createDate
        ]);

        // Confirma la transacción
        await client.query('COMMIT');
        resolve('Pending Item inserted successfully.');
      } catch (error) {
        // Revertir la transacción en caso de error
        await client.query('ROLLBACK');
        reject('Error inserting StockMovement and Items:' + error);
      }
    });
  }

  async insertBrokenItem(failedItems: FailedItemsDto): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      const client = this.clientPg;
      try {
        // Inicia una transacción
        await this.clientPg.query('BEGIN');

        const {
          productCode,
          lot,
          description,
          quantity,
          expiredDate,
          cum,
          warehouse,
          messageId,
          status,
          createDate
        } = failedItems;

        await client.query(insertPending, [
          productCode,
          lot,
          description,
          quantity,
          expiredDate,
          cum,
          warehouse,
          messageId,
          status,
          createDate
        ]);

        // Confirma la transacción
        await client.query('COMMIT');
        resolve('Pending Item inserted successfully.');
      } catch (error) {
        // Revertir la transacción en caso de error
        await client.query('ROLLBACK');
        reject('Error inserting StockMovement and Items:' + error);
      }
    });
  }
}
