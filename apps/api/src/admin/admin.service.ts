import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async listAllSessions(page = 1, perPage = 50) {
    const skip = (page - 1) * perPage;
    const [items, total] = await Promise.all([
      this.prisma.session.findMany({
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        include: { player: { select: { pseudo: true } } },
      }),
      this.prisma.session.count(),
    ]);
    return { items, total, page, perPage };
  }

  async invalidateSession(id: string) {
    const session = await this.prisma.session.findUnique({ where: { id } });
    if (!session) throw new NotFoundException(`Session ${id} not found`);
    return this.prisma.session.update({
      where: { id },
      data: { isValid: false },
    });
  }

  async revalidateSession(id: string) {
    const session = await this.prisma.session.findUnique({ where: { id } });
    if (!session) throw new NotFoundException(`Session ${id} not found`);
    return this.prisma.session.update({
      where: { id },
      data: { isValid: true },
    });
  }

  async listAllPlayers(page = 1, perPage = 50, search?: string) {
    const skip = (page - 1) * perPage;
    const where = search
      ? { pseudo: { contains: search, mode: 'insensitive' as const } }
      : {};
    const [items, total] = await Promise.all([
      this.prisma.player.findMany({
        skip,
        take: perPage,
        where,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { sessions: true } } },
      }),
      this.prisma.player.count({ where }),
    ]);
    return { items, total, page, perPage };
  }

  async deletePlayer(id: string) {
    const player = await this.prisma.player.findUnique({ where: { id } });
    if (!player) throw new NotFoundException(`Player ${id} not found`);
    return this.prisma.player.delete({ where: { id } });
  }

  async getStats() {
    const now = new Date();
    const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalPlayers,
      totalSessions,
      totalInvalidSessions,
      avgDuration,
      maxDuration,
      sessionsLast24h,
      sessionsLast7d,
    ] = await Promise.all([
      this.prisma.player.count(),
      this.prisma.session.count({ where: { isValid: true } }),
      this.prisma.session.count({ where: { isValid: false } }),
      this.prisma.session.aggregate({
        _avg: { durationMs: true },
        where: { isValid: true },
      }),
      this.prisma.session.aggregate({
        _max: { durationMs: true },
        where: { isValid: true },
      }),
      this.prisma.session.count({ where: { createdAt: { gte: since24h } } }),
      this.prisma.session.count({ where: { createdAt: { gte: since7d } } }),
    ]);

    return {
      totalPlayers,
      totalSessions,
      totalInvalidSessions,
      avgDurationMs: avgDuration._avg.durationMs,
      maxDurationMs: maxDuration._max.durationMs,
      sessionsLast24h,
      sessionsLast7d,
    };
  }
}
