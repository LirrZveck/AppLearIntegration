// src/product/controllers/products.controller.ts

import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductService } from '../Services/products.service';
import { ItemDTO, StockMovementDTO } from '../dtos/order.dto';
import { MessageDto } from 'src/messages/dtos/messages.dto';
import { Item } from '../models/produc.model';

@ApiTags('Products')
@Controller('Products')
export class ProductController {
  constructor(private readonly products: ProductService) {}

  @Get('/BIQ/stockMovement')
  @ApiOperation({ summary: 'Result of stock movement from BIQ' })
  @HttpCode(200)
  @ApiResponse({ status: 200, type: StockMovementDTO })
  getMovements() {
    return this.products.getAllMovements();
  }

  @Get('/BIQ/items')
  @ApiOperation({ summary: 'List all items from all stocks_movement inserted' })
  @HttpCode(200)
  @ApiResponse({ status: 200, type: ItemDTO })
  getAllItems() {
    return this.products.getItems();
  }

  @Post('/BIQ/stockMovement')
  @ApiOperation({ summary: 'Insert the list of products from BIQ' })
  @HttpCode(200)
  @ApiResponse({ status: 200, type: StockMovementDTO })
  postProductsBIQ(@Body() payload: StockMovementDTO) {
    return this.products.insertStockMovement(payload);
  }

  @Put('/BIQ/statusproductitem')
  @ApiOperation({ summary: 'Update status Item by Product Code and Lot' })
  @HttpCode(200)
  @ApiResponse({ status: 200, type: MessageDto })
  putItem(@Body() body: { productCode: string; lot: string; status: boolean }) {
    console.log(
      `🛠️ Datos recibidos: productCode=${body.productCode}, lot=${body.lot}, status=${body.status}`,
    );
    return this.products.putItemByCode(body.productCode, body.lot, body.status);
  }

  @Get('/BIQ/produccionPendiente')
  @ApiOperation({ summary: 'List all pending production items' })
  @HttpCode(200)
  @ApiResponse({ status: 200, type: ItemDTO })
  getProduccionPendiente() {
    return this.products.getPendingItems();
  }

  @Post('/BIQ/start-production')
  @ApiOperation({ summary: 'Mueve un item a producción activa.' })
  @HttpCode(200)
  @ApiResponse({ status: 200, type: MessageDto })
  async startProduction(
    @Body()
    body: {
      productCode: string;
      lot: string;
      source: 'item' | 'pending_item';
    },
  ) {
    console.log(
      `🚀 Solicitud de inicio de producción para: ${body.productCode}, Origen: ${body.source}`,
    );
    return this.products.moveToInicioProduccion(
      body.productCode,
      body.lot,
      body.source,
    );
  }

  @Get('/BIQ/inProductionItem')
  @ApiOperation({ summary: 'Retrieve the single item currently in production' })
  @HttpCode(200)
  @ApiResponse({ status: 200, type: ItemDTO })
  async getInProductionItem() {
    console.log('🔍 Solicitud para obtener el ítem en producción.');
    return this.products.getInProductionItem();
  }

  @Get('/getProductionReports')
  @ApiOperation({ summary: 'Retrieve all production reports' })
  @HttpCode(200)
  getProductionReports() {
    return this.products.getProductionReports();
  }

  @Post('/saveProductionReport')
  @ApiOperation({ summary: 'Save production report' })
  @HttpCode(201)
  saveProductionReport(
    @Body()
    reportData: {
      product_code: string;
      description: string;
      total_produced: number;
      damaged_quantity: number;
      remaining_products: number;
    },
  ) {
    return this.products.saveProductionReport(reportData);
  }

  @Post('/BIQ/finalize-production')
  @ApiOperation({
    summary:
      'Finaliza una producción, moviendo el producto a su estado final (finalizado o pendiente).',
  })
  @HttpCode(200)
  @ApiResponse({ status: 200, type: MessageDto })
  async finalizeProduction(
    @Body()
    item: Item,
    originalQuantity: number,
    quantityToProcess: number,
    damagedQuantity: number,
    pendingQuantity: number
    ,
  ) {
    console.log(
      `🎬 Solicitud de finalización para: ${item.productCode} - Lote: ${item.lot}`,
    );
    return this.products.finalizeProduction(item, originalQuantity, quantityToProcess, damagedQuantity, pendingQuantity );
  }
}
