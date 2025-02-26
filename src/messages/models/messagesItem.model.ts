export class Messageitem {
  messageId: string;
  messageDate: Date;
  messageType: string;
  messageUserID: string;
  movementOrder: {
    logisticsCenter: string;
  };
  status: string;
}