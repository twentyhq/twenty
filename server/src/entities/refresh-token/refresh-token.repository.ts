import { Injectable } from '@nestjs/common';
import { Prisma, RefreshToken } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class RefreshTokenRepository {
    constructor(private prisma: PrismaService) {}

    async upsertRefreshToken(params: { data: Prisma.RefreshTokenUncheckedCreateInput}): Promise<RefreshToken> {
        const { data } = params;
  
        return await this.prisma.refreshToken.upsert({
            where: {
                id: data.id,
            },
            create: {
                id: data.id,
                userId: data.userId,
                refreshToken: data.refreshToken,
              },
              update: {
              }
        });
      }

      async findFirst(
        data: Prisma.RefreshTokenFindFirstArgs,
      ): Promise<RefreshToken | null> {
        return await this.prisma.refreshToken.findFirst(data);
      }
}
