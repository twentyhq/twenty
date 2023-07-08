import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChallengeInput } from '../dto/challenge.input';
import { UserService } from 'src/core/user/user.service';
import { assert } from 'src/utils/assert';
import { PASSWORD_REGEX, compareHash, hashPassword } from '../auth.util';
import { Verify } from '../dto/verify.entity';
import { TokenService } from './token.service';
import { Prisma } from '@prisma/client';
import { UserExists } from '../dto/user-exists.entity';

export type UserPayload = {
  firstName: string;
  lastName: string;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
  ) {}

  async challenge(challengeInput: ChallengeInput) {
    let user = await this.userService.findUnique({
      where: {
        email: challengeInput.email,
      },
    });

    const isPasswordValid = PASSWORD_REGEX.test(challengeInput.password);

    assert(!!user || isPasswordValid, 'Password too weak', BadRequestException);

    if (!user) {
      const passwordHash = await hashPassword(challengeInput.password);

      user = await this.userService.createUser({
        data: {
          email: challengeInput.email,
          passwordHash,
          locale: 'en',
        },
      } as Prisma.UserCreateArgs);
    }

    assert(user, "This user doesn't exist", NotFoundException);
    assert(user.passwordHash, 'Incorrect login method', ForbiddenException);

    const isValid = await compareHash(
      challengeInput.password,
      user.passwordHash,
    );

    assert(isValid, 'Wrong password', ForbiddenException);

    return user;
  }

  async verify(
    email: string,
    select: Prisma.UserSelect & {
      id: true;
    },
  ): Promise<Verify> {
    const user = await this.userService.findUnique({
      where: {
        email,
      },
      select,
    });

    assert(user, "This user doesn't exist", NotFoundException);

    // passwordHash is hidden for security reasons
    user.passwordHash = '';

    const accessToken = await this.tokenService.generateAccessToken(user.id);
    const refreshToken = await this.tokenService.generateRefreshToken(user.id);

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async checkUserExists(email: string): Promise<UserExists> {
    const user = await this.userService.findUnique({
      where: {
        email,
      },
    });

    return { exists: !!user };
  }
}
