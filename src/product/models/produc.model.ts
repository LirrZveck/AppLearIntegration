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
  productCode: string; //GS1EAN
  lot: string; //GS1LOTE
  description: string; //
  quantity: number;
  expiredDate: Date; //GS1VALIDADE DD/MM/AA/
  cum: string; //GS1CUM
  warehouse: string;
  messageId: string;
  status: boolean; // Asumiendo que esto se refiere al status_prod de la DB
  createDate: Date;
}

export class ProductionItem {
  id?: number;
  productCode: string;
  lot: string;
  description: string;
  quantity: number;
  expiredDate: Date;
  cum: string;
  warehouse: string;
  messageId: string;
  status: boolean;
  createdate: Date;
  originalSourceTable: 'item' | 'pending_item';
}
