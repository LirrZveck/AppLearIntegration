import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, isDate, IsNumber, IsString } from 'class-validator';

export class ProductionItemDTO {
  @ApiProperty({
    description: 'Código del producto (GS1EAN)',
    example: '123456789012',
  })
  @IsString()
  readonly productCode: string;
  
  @ApiProperty({
    description: 'Lote del producto (GS1LOTE)',
    example: 'LOT12345',
  })
  @IsString()
  readonly lot: string;
  
  @ApiProperty({
    description: 'Descripción del producto',
    example: 'Producto de ejemplo',
  })
  @IsString()
  readonly description: string;
  
  @ApiProperty({
    description: 'Cantidad del producto',
    example: 100,
  })
  @IsNumber()
  readonly quantity: number;

  @ApiProperty({
    description: 'Fecha de expiración del producto',
    example: '2025-12-31',
  })
  @IsDate()
  @Type(() => Date)
  readonly expiredDate: Date;

  @ApiProperty({
    description: 'Código CUM del producto (GS1CUM)',
    example: 'CUM123',
  })
  @IsString()
  readonly cum: string;
  
  @ApiProperty({
    description: 'Almacén donde se encuentra el producto',
    example: 'Almacén A',
  })
  @IsString()
  readonly warehouse: string;
  
  @ApiProperty({
    description: 'ID del mensaje asociado',
    example: 'MSG12345',
  })
  @IsString()
  readonly messageId: string;
  
  @ApiProperty({
    description: 'Estado del producto (activo/inactivo)',
    example: true,
  })
  @IsBoolean()
  readonly status: boolean;
 
  @ApiProperty({
    description: 'Fecha registro',
    example: "2025-12-31",
  })
  @IsDate()
  @Type(() => Date)
  readonly createDate: Date;
}

export class PendingItemDTO {
  @ApiProperty({
    description: 'Código del producto (GS1EAN)',
    example: '987654321098',
  })
  @IsString()
  readonly productCode: string;
  
  @ApiProperty({
    description: 'Lote del producto (GS1LOTE)',
    example: 'LOT67890',
  })
  @IsString()
  readonly lot: string;
  
  @ApiProperty({
    description: 'Descripción del producto',
    example: 'Producto pendiente',
  })
  @IsString()
  readonly description: string;
  
  @ApiProperty({
    description: 'Cantidad del producto',
    example: 50,
  })
  @IsNumber()
  readonly quantity: number;
  
  @ApiProperty({
    description: 'Fecha de expiración del producto',
    example: '2025-06-30',
  })
  @IsDate()
  @Type(()=> Date)
  readonly expiredDate: Date;
  
  @ApiProperty({
    description: 'Código CUM del producto (GS1CUM)',
    example: 'CUM456',
  })
  @IsString()
  readonly cum: string;
  
  @ApiProperty({
    description: 'Almacén donde se encuentra el producto',
    example: 'Almacén B',
  })
  @IsString()
  readonly warehouse: string;
  
  @ApiProperty({
    description: 'ID del mensaje asociado',
    example: 'MSG67890',
  })
  @IsString()
  readonly messageId: string;
  
  @ApiProperty({
    description: 'Estado del producto (activo/inactivo)',
    example: true,
  })
  @IsBoolean()
  readonly status: boolean;

  @ApiProperty({
    description: 'Fecha registro',
    example: "2025-12-31",
  })
  @IsDate()
  @Type(() => Date)
  readonly createDate: Date;
}

export class FailedItemsDto {
  @ApiProperty({
    description: 'Código del producto (GS1EAN)',
    example: '112233445566',
  })
  @IsString()
  readonly productCode: string;
  
  @ApiProperty({
    description: 'Lote del producto (GS1LOTE)',
    example: 'LOT54321',
  })
  @IsString()
  readonly lot: string;
  
  @ApiProperty({
    description: 'Descripción del producto',
    example: 'Producto roto',
  })
  @IsString()
  readonly description: string;
  
  @ApiProperty({
    description: 'Cantidad del producto',
    example: 10,
  })
  @IsNumber()
  readonly quantity: number;

  @ApiProperty({
    description: 'Fecha de expiración del producto',
    example: '2025-03-15',
  })
  @IsDate()
  @Type(()=> Date)
  readonly expiredDate: Date;

  @ApiProperty({
    description: 'Código CUM del producto (GS1CUM)',
    example: 'CUM789',
  })
  @IsString()
  readonly cum: string;
  
  @ApiProperty({
    description: 'Almacén donde se encuentra el producto',
    example: 'Almacén C',
  })
  @IsString()
  readonly warehouse: string;
  
  @ApiProperty({
    description: 'ID del mensaje asociado',
    example: 'MSG54321',
  })
  @IsString()
  readonly messageId: string;
  
  @ApiProperty({
    description: 'Estado del producto (activo/inactivo)',
    example: false,
  })
  @IsBoolean()
  readonly status: boolean;

  
  @ApiProperty({
    description: 'Fecha registro',
    example: "2025-12-31",
  })
  @IsDate()
  @Type(() => Date)
  readonly createDate: Date;
}
