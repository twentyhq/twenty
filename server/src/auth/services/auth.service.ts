import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../strategies/jwt.auth.strategy';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport-google-oauth20';
import { UserRepository } from 'src/entities/user/user.repository';
import { WorkspaceRepository } from 'src/entities/workspace/workspace.repository';
import { RefreshTokenRepository } from 'src/entities/refresh-token/refresh-token.repository';
import { v4 } from 'uuid';
import { RefreshToken, User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userRepository: UserRepository,
    private workspaceRepository: WorkspaceRepository,
    private refreshTokenRepository: RefreshTokenRepository
    ) {}

  async upsertUser(rawUser: { firstName: string, lastName: string, email: string }) {
    if (!rawUser.email) {
      return;
    }

    if (!rawUser.firstName || !rawUser.lastName) {
      return;
    }

    const emailDomain = rawUser.email.split('@')[1];

    if (!emailDomain) {
      return;
    }

    const workspace = await this.workspaceRepository.findUnique({
      where: { domainName: emailDomain },
    });

    if (!workspace) {
      return;
    }

    const user = await this.userRepository.upsertUser({
      data: {
        id: v4(),
        email: rawUser.email,
        displayName: rawUser.firstName + ' ' + rawUser.lastName,
        locale: 'en',
      },
      workspaceId: workspace.id,
    });

    await this.userRepository.upsertWorkspaceMember({
      data: {
        id: v4(),
        userId: user.id,
        workspaceId: workspace.id,
      },
    });

    return user;
  }

  generateAccessToken(refreshToken: string) {
    const refreshTokenObject = this.refreshTokenRepository.findFirst({
      where: { id: refreshToken },
    });

    if (!refreshTokenObject) {
      return;
    }

    const payload: JwtPayload = { username: 'Charles', sub: 1 };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: refreshToken,
    };
  }

  async registerRefreshToken(user: User): Promise<RefreshToken> {
    const refreshToken = await this.refreshTokenRepository.upsertRefreshToken({
      data: {
        id: v4(),
        userId: user.id,
        refreshToken: v4(),
      },
    });

    return refreshToken;
  }

  computeRedirectURI(refreshToken: string): string {
    return `${this.configService.get<string>('FRONT_AUTH_CALLBACK_URL')}?refreshToken=${refreshToken}`;
  }
}