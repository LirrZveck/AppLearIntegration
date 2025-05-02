
export class StockMovement {
  messageID: string;
  messageDate: Date;
  messageType: string;
  messageUserID: string;
  movementOrder: {
    logisticsCenter: string;
  };
  items: Array<Item>;
  status: boolean;
}

export class Item {
  readonly productCode: string; //GS1EAN
  readonly lot: string; //GS1LOTE
  readonly description: string; //
  readonly quantity: number;  
  readonly expiredDate: Date; //GS1VALIDADE DD/MM/AA/
  readonly cum: string; //GS1CUM
  readonly warehouse: string;
}
