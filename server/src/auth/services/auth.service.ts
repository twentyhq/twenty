import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../strategies/jwt.auth.strategy';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from 'src/entities/user/user.repository';
import { WorkspaceRepository } from 'src/entities/workspace/workspace.repository';
import { RefreshTokenRepository } from 'src/entities/refresh-token/refresh-token.repository';
import { v4 } from 'uuid';
import { RefreshToken, User } from '@prisma/client';

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
    private userRepository: UserRepository,
    private workspaceRepository: WorkspaceRepository,
    private refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async upsertUser(rawUser: UserPayload) {
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

    const workspace = await this.workspaceRepository.findUnique({
      where: { domainName: emailDomain },
    });

    if (!workspace) {
      throw new HttpException(
        { reason: 'User email domain does not match an existing workspace' },
        HttpStatus.FORBIDDEN,
      );
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

  async generateAccessToken(refreshToken: string): Promise<string | undefined> {
    const refreshTokenObject = await this.refreshTokenRepository.findFirst({
      where: { refreshToken: refreshToken },
    });

    if (!refreshTokenObject) {
      return;
    }

    const user = await this.userRepository.findUnique({
      where: { id: refreshTokenObject.userId },
    });

    if (!user) {
      return;
    }

    const workspace = await this.workspaceRepository.findFirst({
      where: { workspaceMember: { every: { userId: user.id } } },
    });

    if (!workspace) {
      return;
    }

    const payload: JwtPayload = {
      userId: user.id,
      workspaceId: workspace.id,
    };
    return this.jwtService.sign(payload);
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
    return `${this.configService.get<string>(
      'FRONT_AUTH_CALLBACK_URL',
    )}?refreshToken=${refreshToken}`;
  }
}
