import { Body, Controller, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MessageDto } from 'src/messages/models/messages.model';
import { pendingItem, productionItem } from '../models/movements.model';

@Controller('movement')
export class MovementController {

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
  getProduction(@Body() payload: productionItem) {
    //return this.products.getProductsBIQ();
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
  getPending(@Body() payload: pendingItem) {
    //return this.products.getProductsBIQ();
  }
  
  //------------------------------------POST------------------------------------------//

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
      postPending(@Body() payload: pendingItem) {
        //return this.products.getProductsBIQ();
      }

      @Post('/production')
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
      postProduction(@Body() payload: productionItem) {
        //return this.products.getProductsBIQ();
      }



  //------------------------------------PUTT------------------------------------------//

      @Put('/pending')
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
      putPending(@Param() product: pendingItem) {
        //return this.products.getProductsBIQ();
      }

      @Put('/production')
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
      putProduction(@Param() payload: productionItem) {
        //return this.products.getProductsBIQ();
      }


}
