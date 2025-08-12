import { forwardRef, Module } from '@nestjs/common';
import { ProductController } from './controllers/product.controller';
import { ProductService } from './Services/products.service';
import { MessagesModule } from 'src/messages/messages.module';
import { MessagesService } from 'src/messages/services/messages/messages.service';
import { MovementsModule } from 'src/movements/movements.module';
import { BiqService } from './Services/biq.service';

@Module({
  imports: [MessagesModule, MovementsModule,  forwardRef(() => ProductModule), // Add this line
  ],
  providers: [ProductService, MessagesService, BiqService],
  controllers: [ProductController],
  exports: [ProductService, BiqService]
})
export class ProductModule {}
