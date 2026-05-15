import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CsrfGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('sessions')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  listAllSessions(
    @Query('page') page = 1,
    @Query('perPage') perPage = 50,
  ) {
    return this.adminService.listAllSessions(Number(page), Number(perPage));
  }

  @Patch('sessions/:id/invalidate')
  @HttpCode(200)
  invalidateSession(@Param('id') id: string) {
    return this.adminService.invalidateSession(id);
  }

  @Patch('sessions/:id/revalidate')
  @HttpCode(200)
  revalidateSession(@Param('id') id: string) {
    return this.adminService.revalidateSession(id);
  }

  @Get('players')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'search', required: false })
  listAllPlayers(
    @Query('page') page = 1,
    @Query('perPage') perPage = 50,
    @Query('search') search?: string,
  ) {
    return this.adminService.listAllPlayers(Number(page), Number(perPage), search);
  }

  @Delete('players/:id')
  @HttpCode(200)
  deletePlayer(@Param('id') id: string) {
    return this.adminService.deletePlayer(id);
  }
}
