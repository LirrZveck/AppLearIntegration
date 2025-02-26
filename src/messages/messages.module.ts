import { Module } from '@nestjs/common';
import { MessagesService } from './services/messages/messages.service';

@Module({
  providers: [MessagesService],
})
export class MessagesModule {}
