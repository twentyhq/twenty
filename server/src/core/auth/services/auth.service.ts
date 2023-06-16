import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../strategies/jwt.auth.strategy';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/database/prisma.service';
import { ChallengeInput } from '../dto/challenge.input';
import { UserService } from 'src/core/user/user.service';
import { assert } from 'src/utils/assert';
import { RegisterInput } from '../dto/register.input';
import { PASSWORD_REGEX, compareHash, hashPassword } from '../auth.util';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { TokenEntity } from '../dto/token.entity';
import { TokenExpiredError } from 'jsonwebtoken';
import { VerifyEntity } from '../dto/verify.entity';

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
    private userService: UserService,
  ) {}

  async register(registerInput: RegisterInput) {
    const existingUser = await this.userService.findUnique({
      where: {
        email: registerInput.email,
      },
    });

    assert(!existingUser, 'This user already exist', NotFoundException);
    assert(
      PASSWORD_REGEX.test(registerInput.password),
      'Password too weak',
      BadRequestException,
    );

    const passwordHash = await hashPassword(registerInput.password);

    const user = await this.userService.createUser({
      data: {
        displayName: registerInput.displayName,
        email: registerInput.email,
        passwordHash,
        locale: 'en',
      },
    });

    return user;
  }

  async challenge(challengeInput: ChallengeInput) {
    const user = await this.userService.findUnique({
      where: {
        email: challengeInput.email,
      },
    });

    assert(user, "This user doens't exist", NotFoundException);
    assert(user.passwordHash, 'Something wrong happened', ForbiddenException);

    const isValid = await compareHash(
      challengeInput.password,
      user.passwordHash,
    );

    assert(isValid, 'Something wrong happened', ForbiddenException);

    return user;
  }

  async verify(email: string): Promise<VerifyEntity> {
    const user = await this.userService.findUnique({
      where: {
        email,
      },
    });

    assert(user, "This user doens't exist", NotFoundException);

    const accessToken = await this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async generateAccessToken(userId: string): Promise<TokenEntity> {
    const expires = this.configService.get('ACCESS_TOKEN_EXPIRES_IN');
    const expiresAt = addMilliseconds(new Date().getTime(), expires);

    const user = await this.prismaService.user.findUnique({
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
      userId: user.id,
      workspaceId: user.workspaceMember.workspaceId,
    };

    return {
      token: this.jwtService.sign(jwtPayload),
      expiresAt,
    };
  }

  async generateRefreshToken(userId: string): Promise<TokenEntity> {
    const secret = this.configService.get('REFRESH_TOKEN_SECRET');
    const expires = this.configService.get('REFRESH_TOKEN_EXPIRES_IN');
    const expiresIn = ms(expires);
    const expiresAt = addMilliseconds(new Date().getTime(), expires);

    const refreshTokenPayload = {
      userId,
      expiresAt,
    };
    const jwtPayload = {
      sub: userId,
    };

    const refreshToken = await this.prismaService.refreshToken.create({
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

  async generateLoginToken(email: string): Promise<TokenEntity> {
    const secret = this.configService.get('LOGIN_TOKEN_SECRET');
    const expires = this.configService.get('LOGIN_TOKEN_EXPIRES_IN');
    const expiresIn = ms(expires);
    const expiresAt = addMilliseconds(new Date().getTime(), expires);
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
    const loginTokenSecret = this.configService.get('LOGIN_TOKEN_SECRET');

    const payload = await this.verifyJwt(loginToken, loginTokenSecret);

    return payload.sub;
  }

  async verifyRefreshToken(refreshToken: string) {
    const secret = this.configService.get('REFRESH_TOKEN_SECRET');
    const jwtPayload = await this.verifyJwt(refreshToken, secret);

    assert(
      jwtPayload.jti && jwtPayload.sub,
      'This refresh token is malformed',
      UnprocessableEntityException,
    );

    const token = await this.prismaService.refreshToken.findUnique({
      where: { id: jwtPayload.jti },
    });

    assert(token, "This refresh token doesn't exist", NotFoundException);

    const user = await this.prismaService.user.findUnique({
      where: {
        id: jwtPayload.sub,
      },
      include: {
        refreshTokens: true,
      },
    });

    assert(user, 'User not found', NotFoundException);

    if (token.isRevoked) {
      // Revoke all user refresh tokens
      await this.prismaService.refreshToken.updateMany({
        where: {
          id: {
            in: user.refreshTokens.map(({ id }) => id),
          },
        },
        data: {
          isRevoked: true,
        },
      });
    }

    assert(
      !token.isRevoked,
      'Suspicious activity detected, this refresh token has been revoked. All tokens has been revoked.',
      ForbiddenException,
    );

    return { user, token };
  }

  async generateTokensFromRefreshToken(token: string): Promise<{
    accessToken: TokenEntity;
    refreshToken: TokenEntity;
  }> {
    const {
      user,
      token: { id },
    } = await this.verifyRefreshToken(token);

    // Revoke old refresh token
    await this.prismaService.refreshToken.update({
      where: {
        id,
      },
      data: {
        isRevoked: true,
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
    return `${this.configService.get<string>(
      'FRONT_AUTH_CALLBACK_URL',
    )}?loginToken=${loginToken}`;
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
