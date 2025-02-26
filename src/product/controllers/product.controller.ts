import { Body, Controller, Get, HttpCode, Param, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductService } from '../Services/products.service';
import { Message, MessageDto } from 'src/messages/models/messages.model';
import { StockMovement } from '../models/produc.model';
import { StockMovementDTO } from '../dtos/order.dto';

@Controller('Products')
export class ProductController {
  constructor(private readonly products: ProductService) {}

  @Get('/BIQ/orderList')
  @ApiOperation({ summary: 'Result of products from BIQ' })
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    type: MessageDto,
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
  getProductsBIQ() {
    return this.products.getProductsBIQ();
  }

  /////---------------------Stock Movement-----------------------------////
  @Post('/BIQ/products')
  @ApiOperation({ summary: 'Insert the list of products from BIQ' })
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    type: MessageDto,
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
    return this.products.postProductsBIQ(payload);
  }
}
