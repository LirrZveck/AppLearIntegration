export class BiqStockMovement {
  messageID: string;
  messageDate: Date;
  messageType: string;
  messageUserID: string;
  movementOrder: {
    logisticsCenter: string;
  };
  items: Array<BiqItem>;
}

export class BiqItem {
    itemCode: string;
    batch: string;
    quantity: number;
    plus_movement: string;
    minus_movement: string;
    expDate: Date;
    warehouseCode: string;
    reference_order_number: string;
}
