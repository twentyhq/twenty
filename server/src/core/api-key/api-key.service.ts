import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { addMilliseconds, addSeconds } from 'date-fns';
import ms from 'ms';

import { PrismaService } from 'src/database/prisma.service';
import { AuthToken } from 'src/core/auth/dto/token.entity';
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
  ): Promise<AuthToken> {
    const secret = this.environmentService.getApiTokenSecret();
    let expiresIn: string | number;
    let expirationDate: Date;
    const now = new Date().getTime();
    if (expiresAt) {
      expiresIn = Math.floor((new Date(expiresAt).getTime() - now) / 1000);
      expirationDate = addSeconds(now, expiresIn);
    } else {
      expiresIn = this.environmentService.getApiTokenExpiresIn();
      expirationDate = addMilliseconds(now, ms(expiresIn));
    }
    assert(expiresIn, '', InternalServerErrorException);
    const jwtPayload = {
      sub: workspaceId,
    };
    const { id } = await this.prismaService.client.apiKey.create({
      data: {
        expiresAt: expiresAt,
        name: name,
        workspaceId: workspaceId,
      },
    });
    return {
      token: this.jwtService.sign(jwtPayload, {
        secret,
        expiresIn,
        jwtid: id,
      }),
      expiresAt: expirationDate,
    };
  }
}
