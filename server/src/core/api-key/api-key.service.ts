import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from 'src/database/prisma.service';
import { ApiKeyToken } from 'src/core/auth/dto/token.entity';
import { assert } from 'src/utils/assert';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

@Injectable()
export class ApiKeyService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly environmentService: EnvironmentService,
    private readonly jwtService: JwtService,
  ) {}

  findFirst = this.prismaService.client.apiKey.findFirst;
  findUniqueOrThrow = this.prismaService.client.apiKey.findUniqueOrThrow;
  findMany = this.prismaService.client.apiKey.findMany;
  create = this.prismaService.client.apiKey.create;
  update = this.prismaService.client.apiKey.update;
  delete = this.prismaService.client.apiKey.delete;

  async generateApiKeyToken(
    workspaceId: string,
    name: string,
    expiresAt?: Date | string,
  ): Promise<ApiKeyToken> {
    const secret = this.environmentService.getAccessTokenSecret();
    let expiresIn: string | number;
    const now = new Date().getTime();
    if (expiresAt) {
      expiresIn = Math.floor((new Date(expiresAt).getTime() - now) / 1000);
    } else {
      expiresIn = this.environmentService.getApiTokenExpiresIn();
    }
    assert(expiresIn, '', InternalServerErrorException);
    const jwtPayload = {
      sub: workspaceId,
    };
    const newApiKey = await this.prismaService.client.apiKey.create({
      data: {
        expiresAt: expiresAt,
        name: name,
        workspaceId: workspaceId,
      },
    });
    return {
      ...newApiKey,
      token: this.jwtService.sign(jwtPayload, {
        secret,
        expiresIn,
        jwtid: newApiKey.id,
      }),
    };
  }
}
