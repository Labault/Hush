import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AdminService } from './admin.service';

const mockPrisma = {
  session: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    aggregate: jest.fn(),
  },
  player: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
};

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(AdminService);
    jest.clearAllMocks();
  });

  it('listAllSessions calls findMany with pagination', async () => {
    mockPrisma.session.findMany.mockResolvedValue([]);
    mockPrisma.session.count.mockResolvedValue(0);

    await service.listAllSessions(2, 10);

    expect(mockPrisma.session.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
  });

  it('invalidateSession throws NotFoundException if id not found', async () => {
    mockPrisma.session.findUnique.mockResolvedValue(null);
    await expect(service.invalidateSession('non-existent-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('getStats calls all 7 queries in parallel', async () => {
    mockPrisma.player.count.mockResolvedValue(5);
    mockPrisma.session.count.mockResolvedValue(10);
    mockPrisma.session.aggregate.mockResolvedValue({
      _avg: { durationMs: 1000 },
      _max: { durationMs: 5000 },
    });

    const result = await service.getStats();

    expect(mockPrisma.player.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.session.count).toHaveBeenCalledTimes(4);
    expect(mockPrisma.session.aggregate).toHaveBeenCalledTimes(2);
    expect(result).toHaveProperty('totalPlayers');
    expect(result).toHaveProperty('totalSessions');
    expect(result).toHaveProperty('totalInvalidSessions');
    expect(result).toHaveProperty('avgDurationMs');
    expect(result).toHaveProperty('maxDurationMs');
    expect(result).toHaveProperty('sessionsLast24h');
    expect(result).toHaveProperty('sessionsLast7d');
  });
});
