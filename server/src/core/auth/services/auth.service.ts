import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChallengeInput } from '../dto/challenge.input';
import { UserService } from 'src/core/user/user.service';
import { assert } from 'src/utils/assert';
import { RegisterInput } from '../dto/register.input';
import { PASSWORD_REGEX, compareHash, hashPassword } from '../auth.util';
import { VerifyEntity } from '../dto/verify.entity';
import { TokenService } from './token.service';

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

    assert(user, "This user doesn't exist", NotFoundException);
    assert(user.passwordHash, 'Incorrect login method', ForbiddenException);

    const isValid = await compareHash(
      challengeInput.password,
      user.passwordHash,
    );

    assert(isValid, 'Wrong password', ForbiddenException);

    return user;
  }

  async verify(email: string): Promise<VerifyEntity> {
    const data = await this.userService.findUnique({
      where: {
        email,
      },
    });

    assert(data, "This user doesn't exist", NotFoundException);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...user } = data;

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
}
