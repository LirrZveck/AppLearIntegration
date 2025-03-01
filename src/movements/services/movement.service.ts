import { Inject, Injectable } from '@nestjs/common';
import { StockMovement } from 'src/product/models/produc.model';
import { HttpService } from '@nestjs/axios';


import { BrokengItem, PendingItem, ProductionItem } from '../models/movements.model';
import { Message } from 'src/messages/models/messages.model';
import { MessagesService } from 'src/messages/services/messages/messages.service';
import { Client } from 'pg';


@Injectable()
export class MovementService {
  constructor(private readonly httpService: HttpService,
        private readonly messages: MessagesService,
        @Inject('postgresConnection') private clientPg: Client,
  ) {}

  async getProductionItems(): Promise<ProductionItem[]> {
    return new Promise<ProductionItem[]>((resolve, reject) => {
      try {
        //Realizar la consulta de los datos y devolver el listado de produccion
      } catch (error) {}
    });
  }

  async getPendingItems(): Promise<ProductionItem[]> {
    return new Promise<ProductionItem[]>((resolve, reject) => {
      try {
        //Realizar la consulta de los datos y devolver el listado de pendientes
      } catch (error) {}
    });
  }
  async getBrokenItems(): Promise<ProductionItem[]> {
    return new Promise<ProductionItem[]>((resolve, reject) => {
      try {
        //Realizar la consulta de los datos y devolver el listado de averiados
      } catch (error) {}
    });
  }


  async postProduction(payload: StockMovement): Promise<Message | any> {
    return new Promise<ProductionItem>((resolve, reject) => {
    


    });
  }


  async postPending(payload: StockMovement): Promise<StockMovement | any> {
    return new Promise<PendingItem>((resolve, reject) => {
      switch (payload.movementOrder.logisticsCenter) {
        case '01':
          try {
            this.httpService.get<StockMovement>(
              'https://jsonplaceholder.typicode.com/posts/1',
            );
          } catch (error) {}
          break;

        case '02':
          try {
            this.httpService.get<StockMovement>(
              'https://jsonplaceholder.typicode.com/posts/1',
            );
          } catch (error) {}
          break;
        default:
          break;
      }
    });
  
  }
  async postBroken(payload: StockMovement): Promise<StockMovement | any> {
    return new Promise<BrokengItem>((resolve, reject) => {
      switch (payload.movementOrder.logisticsCenter) {
        case '01':
          try {
            this.httpService.get<StockMovement>(
              'https://jsonplaceholder.typicode.com/posts/1',
            );
          } catch (error) {}
          break;

        case '02':
          try {
            this.httpService.get<StockMovement>(
              'https://jsonplaceholder.typicode.com/posts/1',
            );
          } catch (error) {}
          break;
        default:
          break;
      }
    });
  }
}
