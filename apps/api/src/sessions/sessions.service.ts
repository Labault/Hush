import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSessionDto) {
    const player = await this.prisma.player.findUnique({
      where: { id: dto.playerId },
    });
    if (!player) throw new NotFoundException(`Player ${dto.playerId} not found`);

    const startedAt = new Date(dto.startedAt);
    const endedAt = new Date(dto.endedAt);

    if (endedAt <= startedAt) {
      throw new BadRequestException('endedAt must be after startedAt');
    }

    const durationMs = endedAt.getTime() - startedAt.getTime();

    if (durationMs < 10000) {
      throw new BadRequestException('Session too short, minimum 10 seconds');
    }

    return this.prisma.session.create({
      data: {
        playerId: dto.playerId,
        pseudoSnapshot: player.pseudo,
        startedAt,
        endedAt,
        durationMs,
        isValid: true,
      },
    });
  }

  async getLeaderboard(limit = 100) {
    return this.prisma.session.findMany({
      where: { isValid: true },
      orderBy: { durationMs: 'desc' },
      take: limit,
      select: { id: true, pseudoSnapshot: true, durationMs: true, createdAt: true },
    });
  }
}
