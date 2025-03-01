import { ApiProperty } from '@nestjs/swagger';

export class ProductionItemDTO {
  @ApiProperty({
    description: 'Código del producto (GS1EAN)',
    example: '123456789012',
  })
  readonly productCode: string;

  @ApiProperty({
    description: 'Lote del producto (GS1LOTE)',
    example: 'LOT12345',
  })
  readonly lot: string;

  @ApiProperty({
    description: 'Descripción del producto',
    example: 'Producto de ejemplo',
  })
  readonly description: string;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 100,
  })
  readonly quantity: number;

  @ApiProperty({
    description: 'Fecha de expiración del producto',
    example: '2025-12-31',
  })
  readonly expiredDate: Date;

  @ApiProperty({
    description: 'Código CUM del producto (GS1CUM)',
    example: 'CUM123',
  })
  readonly cum: string;

  @ApiProperty({
    description: 'Almacén donde se encuentra el producto',
    example: 'Almacén A',
  })
  readonly warehouse: string;

  @ApiProperty({
    description: 'ID del mensaje asociado',
    example: 'MSG12345',
  })
  readonly messageId: string;

  @ApiProperty({
    description: 'Estado del producto (activo/inactivo)',
    example: true,
  })
  readonly status: boolean;
}

export class PendingItemDTO {
  @ApiProperty({
    description: 'Código del producto (GS1EAN)',
    example: '987654321098',
  })
  readonly productCode: string;

  @ApiProperty({
    description: 'Lote del producto (GS1LOTE)',
    example: 'LOT67890',
  })
  readonly lot: string;

  @ApiProperty({
    description: 'Descripción del producto',
    example: 'Producto pendiente',
  })
  readonly description: string;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 50,
  })
  readonly quantity: number;

  @ApiProperty({
    description: 'Fecha de expiración del producto',
    example: '2025-06-30',
  })
  readonly expiredDate: Date;

  @ApiProperty({
    description: 'Código CUM del producto (GS1CUM)',
    example: 'CUM456',
  })
  readonly cum: string;

  @ApiProperty({
    description: 'Almacén donde se encuentra el producto',
    example: 'Almacén B',
  })
  readonly warehouse: string;

  @ApiProperty({
    description: 'ID del mensaje asociado',
    example: 'MSG67890',
  })
  readonly messageId: string;

  @ApiProperty({
    description: 'Estado del producto (activo/inactivo)',
    example: true,
  })
  readonly status: boolean;
}

export class FailedItemsDto {
  @ApiProperty({
    description: 'Código del producto (GS1EAN)',
    example: '112233445566',
  })
  readonly productCode: string;

  @ApiProperty({
    description: 'Lote del producto (GS1LOTE)',
    example: 'LOT54321',
  })
  readonly lot: string;

  @ApiProperty({
    description: 'Descripción del producto',
    example: 'Producto roto',
  })
  readonly description: string;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 10,
  })
  readonly quantity: number;

  @ApiProperty({
    description: 'Fecha de expiración del producto',
    example: '2025-03-15',
  })
  readonly expiredDate: Date;

  @ApiProperty({
    description: 'Código CUM del producto (GS1CUM)',
    example: 'CUM789',
  })
  readonly cum: string;

  @ApiProperty({
    description: 'Almacén donde se encuentra el producto',
    example: 'Almacén C',
  })
  readonly warehouse: string;

  @ApiProperty({
    description: 'ID del mensaje asociado',
    example: 'MSG54321',
  })
  readonly messageId: string;

  @ApiProperty({
    description: 'Estado del producto (activo/inactivo)',
    example: false,
  })
  readonly status: boolean;
}
