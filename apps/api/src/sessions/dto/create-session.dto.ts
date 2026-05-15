import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsUUID } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty()
  @IsUUID()
  playerId: string;

  @ApiProperty()
  @IsISO8601()
  startedAt: string;

  @ApiProperty()
  @IsISO8601()
  endedAt: string;
}
