import { Body, Controller, Get, HttpCode, Param, Post, Res, Put, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MessageDto } from 'src/messages/models/messages.model';
import { PendingItem, ProductionItem } from '../models/movements.model';
import { MovementService } from '../services/movement.service';
import { FailedItemsDto, PendingItemDTO, ProductionItemDTO } from '../dtos/movement.dto';

@Controller('movement')
export class MovementController {

  constructor(private readonly movementService: MovementService ){}

  //------------------------------------GET------------------------------------------//
  @Get('/production')
  @ApiOperation({ summary: 'Consult List of Production Items' })
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
  getAllProduction() {
    return this.movementService.selectProductionItems();
  }
  
  @Get('/pending')
  @ApiOperation({ summary: 'Consult List of Pending Items' })
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
  getPending(@Body() payload: PendingItemDTO) {
    //return this.products.getProductsBIQ();
  }

  @Get('/failed')
  @ApiOperation({ summary: 'Consult List of Failed Items' })
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
  getFailed(@Body() payload: PendingItemDTO) {
    //return this.products.getProductsBIQ();
  }
  




  //------------------------------------POST---------------------------------------------------//
  //--------PENDING----------------------//
  @Post('/pending')
  @ApiOperation({ summary: 'Insert Items Pending from a Production' })
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
  postPending(@Body() payload: PendingItemDTO) {
    return this.movementService.insertPendingItem(payload);
  }
  
  //--------PRODUCTION----------------------//
  @Post('/production')
  @ApiOperation({ summary: 'Insert the list of products from BIQ' })
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    type: ProductionItemDTO,
    description: 'Successfully inserted the product',
  })
  @ApiResponse({
    status: 400,
    type: MessageDto,
    description: 'Bad request, please check the body structure.',
  })
  @ApiResponse({
    status: 500,
    type: MessageDto,
    description: 'Internal Server Error. Connection error.',
  })
  postProduction(@Body() payload: ProductionItemDTO) {
    return this.movementService.insertProductionItem(payload);
  }
  
  //--------BROKEN----------------------//
  @Post('/failed')
  @ApiOperation({ summary: 'Insert Items Failed from a Production' })
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
      postBroken(@Body() payload: FailedItemsDto) {
        return this.movementService.insertBrokenItem(payload);
      }


  
  //------------------------------------PUTT---------------------------------------------------//
      @Put('/pendingInactive')
      @ApiOperation({ summary: 'Insert Items Pending from a Production' })
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
      putPending(@Param() product: PendingItemDTO) {
        //return this.products.getProductsBIQ();
      }

      @Put('/productionInactive')
      @ApiOperation({ summary: 'Inserts the products generated in production' })
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
      putProduction(@Param() payload: ProductionItemDTO) {
        //return this.movementService.updateProduction(payload);
      }

}
