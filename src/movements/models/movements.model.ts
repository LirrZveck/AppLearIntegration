export class productionItem {
    readonly productCode: string; //GS1EAN
    readonly lot: string; //GS1LOTE
    readonly description: string; //
    readonly quantity: number;  
    readonly expiredDate: Date; //GS1VALIDADE DD/MM/AA/
    readonly cum: string; //GS1CUM
    readonly warehouse: string; 
    readonly status: boolean;
  }

export class pendingItem {
    readonly productCode: string; //GS1EAN
    readonly lot: string; //GS1LOTE
    readonly description: string; //
    readonly quantity: number;  
    readonly expiredDate: Date; //GS1VALIDADE DD/MM/AA/
    readonly cum: string; //GS1CUM
    readonly warehouse: string;
    readonly status: boolean;
  }