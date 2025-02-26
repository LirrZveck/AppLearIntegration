import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MovementController } from './controllers/movement.controller';
import { MovementService } from './services/movement.service';


@Module({
  imports: [HttpModule],
  controllers: [MovementController],
  providers: [MovementService]
})
export class MovementsModule {}
