import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ApiKeyService {
  constructor(private readonly prismaService: PrismaService) {}

  findFirst = this.prismaService.client.apiKey.findFirst;
  findUniqueOrThrow = this.prismaService.client.apiKey.findUniqueOrThrow;
  findMany = this.prismaService.client.apiKey.findMany;
  create = this.prismaService.client.apiKey.create;
  update = this.prismaService.client.apiKey.update;
  delete = this.prismaService.client.apiKey.delete;
}
