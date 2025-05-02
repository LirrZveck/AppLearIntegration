import { IsString, IsDate, IsNumber, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ItemDTO {
  @IsString()
  readonly productCode: string; // GS1EAN

  @IsString()
  readonly lot: string; // GS1LOTE

  @IsString()
  readonly description: string;

  @IsNumber()
  readonly quantity: number;

  @IsDate()
  @Type(() => Date)
  readonly expiredDate: Date; // GS1VALIDADE DD/MM/AA

  @IsString()
  readonly cum: string; // GS1CUM

  @IsString()
  readonly warehouse: string;
}

export class MovementOrderDTO {
  @IsString()
  readonly logisticsCenter: string;
}

export class StockMovementDTO {
  @IsString()
  readonly messageID: string;

  @IsDate()
  @Type(() => Date)
  readonly messageDate: Date;

  @IsString()
  readonly messageType: string;

  @IsString()
  readonly messageUserID: string;

  @ValidateNested()
  @Type(() => MovementOrderDTO)
  readonly movementOrder: MovementOrderDTO;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDTO)
  readonly items: Array<ItemDTO>;
  
  @IsBoolean()
  readonly status: boolean;
}
