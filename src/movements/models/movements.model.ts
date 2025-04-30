export class ProductionItem {
    readonly productCode: string; //GS1EAN
    readonly lot: string; //GS1LOTE
    readonly description: string; //
    readonly quantity: number;  
    readonly expiredDate: Date; //GS1VALIDADE DD/MM/AA/
    readonly cum: string; //GS1CUM
    readonly warehouse: string; 
    readonly messageId: string;
    readonly status: boolean;
    readonly createDate: Date;
  }

export class PendingItem {
    readonly productCode: string; //GS1EAN
    readonly lot: string; //GS1LOTE
    readonly description: string; //
    readonly quantity: number;  
    readonly expiredDate: Date; //GS1VALIDADE DD/MM/AA/
    readonly cum: string; //GS1CUM
    readonly warehouse: string;
    readonly messageId: string;
    readonly status: boolean;
    readonly createDate: Date;
  }


  export class FailedItems {
    readonly productCode: string; //GS1EAN
    readonly lot: string; //GS1LOTE
    readonly description: string; //
    readonly quantity: number;  
    readonly expiredDate: Date; //GS1VALIDADE DD/MM/AA/
    readonly cum: string; //GS1CUM
    readonly warehouse: string;
    readonly messageId: string;
    readonly status: boolean;
    readonly createDate: Date;
  }

