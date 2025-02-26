import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class MessageDto {
  @ApiProperty()
  @IsString()
  readonly message: string[];
  @IsString()
  @ApiProperty()
  readonly error: string;
  @ApiProperty()
  @IsString()
  readonly status: string;
  @ApiProperty()
  @IsString()
  readonly statusCode: number;
  @ApiProperty()
  @IsString()
  readonly payload: any;
}
