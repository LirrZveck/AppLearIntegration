import { Body, Controller, Get, HttpCode, Param, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductService } from '../Services/products.service';
import { ItemDTO, StockMovementDTO } from '../dtos/order.dto';
import { MessageDto } from 'src/messages/dtos/messages.dto';

@Controller('Products')
export class ProductController {
  constructor(private readonly products: ProductService) {}

  @Get('/BIQ/stockMovement')
  @ApiOperation({ summary: 'Result of stock movement from BIQ' })
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    type: StockMovementDTO,
  })
  @ApiResponse({
    status: 400,
    type: MessageDto,
    description: 'Bad request please check body structure.',
  })
  @ApiResponse({
    status: 500,
    type: MessageDto,
    description: 'Internal Server Error. Connection error.',
  })
  getMovements() {
    return this.products.getAllMovements();

  }
  @Get('/BIQ/items')
  @ApiOperation({ summary: 'List all items from all stocks_movement inserted' })
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    type: ItemDTO,
  })
  @ApiResponse({
    status: 400,
    type: MessageDto,
    description: 'Bad request please check body structure.',
  })
  @ApiResponse({
    status: 500,
    type: MessageDto,
    description: 'Internal Server Error. Connection error.',
  })
  getAllItems() {
    return this.products.getItems();
  }

  /////---------------------POST Stock Movement-----------------------------////
  @Post('/BIQ/stockMovement')
  @ApiOperation({ summary: 'Insert the list of products from BIQ' })
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    type: StockMovementDTO,
    description: ''
  })
  @ApiResponse({
    status: 400,
    type: MessageDto,
    description: 'Bad request please check body structure.',
  })
  @ApiResponse({
    status: 500,
    type: MessageDto,
    description: 'Internal Server Error. Connection error.',
  })
  postProductsBIQ(@Body() payload: StockMovementDTO) {
    console.log('Stock Movement', payload)
    return this.products.insertStockMovement(payload);
  }
}
