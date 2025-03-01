import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MovementController } from './controllers/movement.controller';
import { MovementService } from './services/movement.service';
import { MessagesModule } from 'src/messages/messages.module';
import { MessagesService } from 'src/messages/services/messages/messages.service';


@Module({
  imports: [HttpModule, MessagesModule],
  controllers: [MovementController],
  providers: [MovementService, MessagesService]
})
export class MovementsModule {}
