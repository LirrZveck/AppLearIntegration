import { Injectable } from '@nestjs/common';
import { StockMovement } from 'src/product/models/produc.model';
import { HttpService } from '@nestjs/axios';


import { productionItem } from '../models/movements.model';

@Injectable()
export class MovementService {
  constructor(private readonly httpService: HttpService) {}

  async getProduction(): Promise<productionItem[]> {
    return new Promise<productionItem[]>((resolve, reject) => {
      try {
        //Realizar la consulta de los datos y devolver el listado de produccion
      } catch (error) {}
    });
  }


  async postProduction(payload: StockMovement): Promise<StockMovement | any> {
    return new Promise<productionItem[]>((resolve, reject) => {
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


  async postPending(payload: StockMovement): Promise<StockMovement | any> {
    return new Promise<productionItem[]>((resolve, reject) => {
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
