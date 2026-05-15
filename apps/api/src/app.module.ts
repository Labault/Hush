import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { PlayersModule } from './players/players.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [PrismaModule, HealthModule, PlayersModule, SessionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
