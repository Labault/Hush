import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionsService } from './sessions.service';

const mockPlayer = { id: 'player-uuid-1111', pseudo: 'TestUser', createdAt: new Date() };

const mockSession = {
  id: 'session-uuid-1111',
  playerId: mockPlayer.id,
  pseudoSnapshot: mockPlayer.pseudo,
  startedAt: new Date('2026-05-15T10:00:00Z'),
  endedAt: new Date('2026-05-15T10:00:15Z'),
  durationMs: 15000,
  isValid: true,
  createdAt: new Date(),
};

const prismaMock = {
  player: {
    findUnique: jest.fn(),
  },
  session: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('SessionsService', () => {
  let service: SessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionsService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    jest.clearAllMocks();
  });

  it('rejects if durationMs < 10000', async () => {
    prismaMock.player.findUnique.mockResolvedValue(mockPlayer);
    const dto: CreateSessionDto = {
      playerId: mockPlayer.id,
      startedAt: '2026-05-15T10:00:00Z',
      endedAt: '2026-05-15T10:00:05Z',
    };
    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    await expect(service.create(dto)).rejects.toThrow('Session too short, minimum 10 seconds');
  });

  it('rejects if endedAt < startedAt', async () => {
    prismaMock.player.findUnique.mockResolvedValue(mockPlayer);
    const dto: CreateSessionDto = {
      playerId: mockPlayer.id,
      startedAt: '2026-05-15T10:00:15Z',
      endedAt: '2026-05-15T10:00:00Z',
    };
    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    await expect(service.create(dto)).rejects.toThrow('endedAt must be after startedAt');
  });

  it('rejects if playerId does not exist', async () => {
    prismaMock.player.findUnique.mockResolvedValue(null);
    const dto: CreateSessionDto = {
      playerId: 'nonexistent-uuid',
      startedAt: '2026-05-15T10:00:00Z',
      endedAt: '2026-05-15T10:00:15Z',
    };
    await expect(service.create(dto)).rejects.toThrow(NotFoundException);
  });

  it('returns session with correct durationMs when valid', async () => {
    prismaMock.player.findUnique.mockResolvedValue(mockPlayer);
    prismaMock.session.create.mockResolvedValue(mockSession);
    const dto: CreateSessionDto = {
      playerId: mockPlayer.id,
      startedAt: '2026-05-15T10:00:00Z',
      endedAt: '2026-05-15T10:00:15Z',
    };
    const result = await service.create(dto);
    expect(result.durationMs).toBe(15000);
    expect(prismaMock.session.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ durationMs: 15000, isValid: true }),
      }),
    );
  });

  it('getLeaderboard calls findMany with correct args', async () => {
    prismaMock.session.findMany.mockResolvedValue([]);
    await service.getLeaderboard(50);
    expect(prismaMock.session.findMany).toHaveBeenCalledWith({
      where: { isValid: true },
      orderBy: { durationMs: 'desc' },
      take: 50,
      select: { id: true, pseudoSnapshot: true, durationMs: true, createdAt: true },
    });
  });

  it('getByPlayer calls findMany with correct args', async () => {
    prismaMock.player.findUnique.mockResolvedValue(mockPlayer);
    prismaMock.session.findMany.mockResolvedValue([]);
    await service.getByPlayer(mockPlayer.id, 5);
    expect(prismaMock.session.findMany).toHaveBeenCalledWith({
      where: { playerId: mockPlayer.id, isValid: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        pseudoSnapshot: true,
        durationMs: true,
        createdAt: true,
        startedAt: true,
        endedAt: true,
      },
    });
  });

  it('getByPlayer throws NotFoundException if player not found', async () => {
    prismaMock.player.findUnique.mockResolvedValue(null);
    await expect(service.getByPlayer('nonexistent-uuid', 5)).rejects.toThrow(NotFoundException);
  });
});
