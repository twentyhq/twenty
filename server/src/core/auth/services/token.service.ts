import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { TokenExpiredError } from 'jsonwebtoken';

import { JwtPayload } from 'src/core/auth/strategies/jwt.auth.strategy';
import { PrismaService } from 'src/database/prisma.service';
import { assert } from 'src/utils/assert';
import { AuthToken } from 'src/core/auth/dto/token.entity';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly environmentService: EnvironmentService,
    private readonly prismaService: PrismaService,
  ) {}

  async generateAccessToken(userId: string): Promise<AuthToken> {
    const expiresIn = this.environmentService.getAccessTokenExpiresIn();
    assert(expiresIn, '', InternalServerErrorException);
    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    const user = await this.prismaService.client.user.findUnique({
      where: { id: userId },
      include: {
        workspaceMember: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User is not found');
    }

    if (!user.workspaceMember) {
      throw new ForbiddenException('User is not associated to a workspace');
    }

    const jwtPayload: JwtPayload = {
      sub: user.id,
      workspaceId: user.workspaceMember.workspaceId,
    };

    return {
      token: this.jwtService.sign(jwtPayload),
      expiresAt,
    };
  }

  async generateRefreshToken(userId: string): Promise<AuthToken> {
    const secret = this.environmentService.getRefreshTokenSecret();
    const expiresIn = this.environmentService.getRefreshTokenExpiresIn();
    assert(expiresIn, '', InternalServerErrorException);
    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    const refreshTokenPayload = {
      userId,
      expiresAt,
    };
    const jwtPayload = {
      sub: userId,
    };

    const refreshToken = await this.prismaService.client.refreshToken.create({
      data: refreshTokenPayload,
    });

    return {
      token: this.jwtService.sign(jwtPayload, {
        secret,
        expiresIn,
        // Jwtid will be used to link RefreshToken entity to this token
        jwtid: refreshToken.id,
      }),
      expiresAt,
    };
  }

  async generateApiKeyToken(workspaceId: string): Promise<AuthToken> {
    const secret = this.environmentService.getLoginTokenSecret();
    const expiresIn = this.environmentService.getApiTokenExpiresIn();
    assert(expiresIn, '', InternalServerErrorException);
    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));
    const jwtPayload = {
      sub: workspaceId,
    };
    return {
      token: this.jwtService.sign(jwtPayload, {
        secret,
        expiresIn,
      }),
      expiresAt,
    };
  }

  async generateLoginToken(email: string): Promise<AuthToken> {
    const secret = this.environmentService.getLoginTokenSecret();
    const expiresIn = this.environmentService.getLoginTokenExpiresIn();
    assert(expiresIn, '', InternalServerErrorException);
    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));
    const jwtPayload = {
      sub: email,
    };

    return {
      token: this.jwtService.sign(jwtPayload, {
        secret,
        expiresIn,
      }),
      expiresAt,
    };
  }

  async verifyLoginToken(loginToken: string): Promise<string> {
    const loginTokenSecret = this.environmentService.getLoginTokenSecret();

    const payload = await this.verifyJwt(loginToken, loginTokenSecret);

    return payload.sub;
  }

  async verifyRefreshToken(refreshToken: string) {
    const secret = this.environmentService.getRefreshTokenSecret();
    const coolDown = this.environmentService.getRefreshTokenCoolDown();
    const jwtPayload = await this.verifyJwt(refreshToken, secret);

    assert(
      jwtPayload.jti && jwtPayload.sub,
      'This refresh token is malformed',
      UnprocessableEntityException,
    );

    const token = await this.prismaService.client.refreshToken.findUnique({
      where: { id: jwtPayload.jti },
    });

    assert(token, "This refresh token doesn't exist", NotFoundException);

    const user = await this.prismaService.client.user.findUnique({
      where: {
        id: jwtPayload.sub,
      },
      include: {
        refreshTokens: true,
      },
    });

    assert(user, 'User not found', NotFoundException);

    // Check if revokedAt is less than coolDown
    if (
      token.revokedAt &&
      token.revokedAt.getTime() <= Date.now() - ms(coolDown)
    ) {
      // Revoke all user refresh tokens
      await this.prismaService.client.refreshToken.updateMany({
        where: {
          id: {
            in: user.refreshTokens.map(({ id }) => id),
          },
        },
        data: {
          revokedAt: new Date(),
        },
      });

      throw new ForbiddenException(
        'Suspicious activity detected, this refresh token has been revoked. All tokens has been revoked.',
      );
    }

    return { user, token };
  }

  async generateTokensFromRefreshToken(token: string): Promise<{
    accessToken: AuthToken;
    refreshToken: AuthToken;
  }> {
    const {
      user,
      token: { id },
    } = await this.verifyRefreshToken(token);

    // Revoke old refresh token
    await this.prismaService.client.refreshToken.update({
      where: {
        id,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    const accessToken = await this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
    };
  }

  computeRedirectURI(loginToken: string): string {
    return `${this.environmentService.getFrontAuthCallbackUrl()}?loginToken=${loginToken}`;
  }

  async verifyJwt(token: string, secret?: string) {
    try {
      return this.jwtService.verify(token, secret ? { secret } : undefined);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token has expired.');
      } else {
        throw new UnprocessableEntityException();
      }
    }
  }
}
