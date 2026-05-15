import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

const mockAdmin = {
  id: 'admin-id-1',
  username: 'labault',
  passwordHash: 'hashed-password',
  createdAt: new Date(),
};

const mockPrisma = {
  admin: {
    findUnique: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('signed-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('validateAdmin throws UnauthorizedException if admin not found', async () => {
    mockPrisma.admin.findUnique.mockResolvedValue(null);
    await expect(
      service.validateAdmin('unknown', 'password'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('validateAdmin throws UnauthorizedException if password incorrect', async () => {
    mockPrisma.admin.findUnique.mockResolvedValue(mockAdmin);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(
      service.validateAdmin('labault', 'wrong-password'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('login returns token and admin if credentials valid', async () => {
    mockPrisma.admin.findUnique.mockResolvedValue(mockAdmin);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    mockJwt.sign.mockReturnValue('signed-token');

    const result = await service.login({
      username: 'labault',
      password: 'validpassword',
    });

    expect(result.token).toBe('signed-token');
    expect(result.admin.username).toBe('labault');
    expect(result.admin).not.toHaveProperty('passwordHash');
  });

  it('getAdminById returns admin without passwordHash', async () => {
    mockPrisma.admin.findUnique.mockResolvedValue(mockAdmin);
    const result = await service.getAdminById('admin-id-1');
    expect(result).not.toHaveProperty('passwordHash');
    expect(result?.username).toBe('labault');
  });
});
