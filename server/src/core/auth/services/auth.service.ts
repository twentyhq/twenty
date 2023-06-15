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

  async createUser(rawUser: UserPayload) {
    if (!rawUser.email) {
      throw new HttpException(
        { reason: 'Email is missing' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!rawUser.firstName || !rawUser.lastName) {
      throw new HttpException(
        { reason: 'Firstname or lastname is missing' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const emailDomain = rawUser.email.split('@')[1];

    if (!emailDomain) {
      throw new HttpException(
        { reason: 'Email is malformed' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const workspace = await this.prismaService.workspace.findUnique({
      where: { domainName: emailDomain },
    });

    if (!workspace) {
      throw new HttpException(
        { reason: 'User email domain does not match an existing workspace' },
        HttpStatus.FORBIDDEN,
      );
    }

    const user = await this.prismaService.user.upsert({
      where: {
        email: rawUser.email,
      },
      create: {
        id: v4(),
        displayName: rawUser.firstName + ' ' + rawUser.lastName,
        email: rawUser.email,
        locale: 'en',
      },
      update: {},
    });

    await this.prismaService.workspaceMember.upsert({
      where: {
        userId: user.id,
      },
      create: {
        id: v4(),
        userId: user.id,
        workspaceId: workspace.id,
      },
      update: {},
    });

    return user;
  }

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
