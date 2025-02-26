import { Client } from 'pg';
import { ConfigModule } from '@nestjs/config';

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { MessagesModule } from './messages/messages.module';
import { enviroments } from '../enviroments';
import { DatabaseModule } from './database/database.module';
import { MovementsModule } from './movements/movements.module';



@Module({
  imports: [
    ProductModule,
    MovementsModule,
    MessagesModule,
    ConfigModule.forRoot({
      envFilePath: enviroments[process.env.NODE_ENV] || '.env',
      isGlobal: true,
    }),
    DatabaseModule,
    MovementsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
