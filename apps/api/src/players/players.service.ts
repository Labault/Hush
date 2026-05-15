import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

@Injectable()
export class PlayersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePlayerDto) {
    return this.prisma.player.create({ data: { pseudo: dto.pseudo } });
  }

  async findOne(id: string) {
    const player = await this.prisma.player.findUnique({ where: { id } });
    if (!player) throw new NotFoundException(`Player ${id} not found`);
    return player;
  }

  async updatePseudo(id: string, dto: UpdatePlayerDto) {
    await this.findOne(id);
    return this.prisma.player.update({ where: { id }, data: { pseudo: dto.pseudo } });
  }
}
