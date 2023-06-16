import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../strategies/jwt.auth.strategy';
import { ConfigService } from '@nestjs/config';
import { v4 } from 'uuid';
import { RefreshToken, User } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

export type UserPayload = {
  firstName: string;
  lastName: string;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {}

  async generateAccessToken(refreshToken: string): Promise<string | undefined> {
    const refreshTokenObject = await this.prismaService.refreshToken.findFirst({
      where: { refreshToken: refreshToken },
    });

    if (!refreshTokenObject) {
      throw new HttpException(
        { reason: 'Invalid Refresh token' },
        HttpStatus.FORBIDDEN,
      );
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: refreshTokenObject.userId },
    });

    if (!user) {
      throw new HttpException(
        { reason: 'Refresh token is not associated to a valid user' },
        HttpStatus.FORBIDDEN,
      );
    }

    const workspace = await this.prismaService.workspace.findFirst({
      where: { workspaceMember: { some: { userId: user.id } } },
    });

    if (!workspace) {
      throw new HttpException(
        { reason: 'Refresh token is not associated to a valid workspace' },
        HttpStatus.FORBIDDEN,
      );
    }

    const payload: JwtPayload = {
      userId: user.id,
      workspaceId: workspace.id,
    };
    return this.jwtService.sign(payload);
  }

  async registerRefreshToken(user: User): Promise<RefreshToken> {
    const refreshToken = await this.prismaService.refreshToken.upsert({
      where: {
        id: user.id,
      },
      create: {
        id: v4(),
        userId: user.id,
        refreshToken: v4(),
      },
      update: {},
    });

    return refreshToken;
  }

  computeRedirectURI(refreshToken: string): string {
    return `${this.configService.get<string>(
      'FRONT_AUTH_CALLBACK_URL',
    )}?refreshToken=${refreshToken}`;
  }
}
