import { Injectable } from '@nestjs/common';

import crypto from 'crypto';

import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ApiKeyService {
  constructor(private readonly prismaService: PrismaService) {}

  findUniqueOrThrow = this.prismaService.client.apiKey.findUniqueOrThrow;
  create = this.prismaService.client.apiKey.create;

  async createApiKey({
    name,
    workspaceId,
  }: {
    name: string;
    workspaceId: string;
  }) {
    const customApiKey = 'test123';
    crypto.createHash('md5').update(customApiKey).digest('hex');
    await this.create({
      data: {
        key: customApiKey,
        name,
        workspace: { connect: { id: workspaceId } },
      },
    });
    return this.findUniqueOrThrow({
      where: { key: customApiKey },
    });
  }
}
