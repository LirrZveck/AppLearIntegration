import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsString } from 'class-validator';

export class MessageitemDto {
  @ApiProperty()
  @IsString()
  readonly messageId: string[];
  @ApiProperty()
  @IsDateString()
  readonly messageDate: Date;
  @ApiProperty()
  @IsNumber()
  readonly messageType: string;
  @ApiProperty()
  @IsDateString()
  readonly messageUserID: string;
  @ApiProperty()
  @IsString()
  readonly movementOrder: string;
  @ApiProperty()
  @IsString()
  readonly status: string;
}
