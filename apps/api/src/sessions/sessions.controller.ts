import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionsService } from './sessions.service';

@ApiTags('sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Session created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Player not found' })
  create(@Body() dto: CreateSessionDto) {
    return this.sessionsService.create(dto);
  }

  @Get('leaderboard')
  @ApiResponse({ status: 200, description: 'Leaderboard' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getLeaderboard(
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ) {
    const capped = Math.min(limit, 100);
    return this.sessionsService.getLeaderboard(capped);
  }

  @Get('by-player/:playerId')
  @ApiResponse({ status: 200, description: 'Sessions by player' })
  @ApiResponse({ status: 404, description: 'Player not found' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getByPlayer(
    @Param('playerId', ParseUUIDPipe) playerId: string,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    return this.sessionsService.getByPlayer(playerId, Math.min(limit, 20));
  }
}
