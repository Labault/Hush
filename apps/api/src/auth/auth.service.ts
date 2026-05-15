import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateAdmin(username: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { username } });
    if (!admin) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return admin;
  }

  async login(dto: LoginDto) {
    const admin = await this.validateAdmin(dto.username, dto.password);
    const token = this.jwtService.sign({
      sub: admin.id,
      username: admin.username,
    });
    return { token, admin: { id: admin.id, username: admin.username } };
  }

  async getAdminById(id: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    if (!admin) return null;
    const { passwordHash: _, ...rest } = admin;
    return rest;
  }
}
