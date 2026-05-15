import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth() {
    const dbOk = await this.healthService.checkDb();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: dbOk ? 'connected' : 'error',
    };
  }
}
