import { Module } from '@nestjs/common';
import { ProductController } from './controllers/product.controller';
import { ProductService } from './Services/products.service';
import { MessagesModule } from 'src/messages/messages.module';
import { MessagesService } from 'src/messages/services/messages/messages.service';
import { MovementsModule } from 'src/movements/movements.module';

@Module({
  imports: [MessagesModule, MovementsModule],
  providers: [ProductService, MessagesService],
  controllers: [ProductController],
})
export class ProductModule {}
