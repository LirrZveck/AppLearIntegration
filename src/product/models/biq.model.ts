export class BiqStockMovement {
  messageID: String;
  messageDate: Date;
  messageType: String;
  messageUserID: String;
  movementOrder: {
    logisticsCenter: String;
  };
  items: Array<BiqItem>;
  status: Boolean
}

export class BiqItem {
    itemCode: String;
    batch: String;
    quantity: Number;
    plus_movement: String;
    minus_movement: String;
    expDate: Date;
    warehouseCode: String;
    reference_order_number: String;
}
