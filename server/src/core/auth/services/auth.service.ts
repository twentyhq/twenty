import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { ChallengeInput } from 'src/core/auth/dto/challenge.input';
import { UserService } from 'src/core/user/user.service';
import { assert } from 'src/utils/assert';
import {
  PASSWORD_REGEX,
  compareHash,
  hashPassword,
} from 'src/core/auth/auth.util';
import { Verify } from 'src/core/auth/dto/verify.entity';
import { UserExists } from 'src/core/auth/dto/user-exists.entity';
import { WorkspaceService } from 'src/core/workspace/services/workspace.service';
import { WorkspaceInviteHashValid } from 'src/core/auth/dto/workspace-invite-hash-valid.entity';
import { SignUpInput } from 'src/core/auth/dto/sign-up.input';

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
    private readonly workspaceService: WorkspaceService,
  ) {}

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

  async signUp(signUpInput: SignUpInput) {
    const existingUser = await this.userService.findUnique({
      where: {
        email: signUpInput.email,
      },
    });
    assert(!existingUser, 'This user already exists', ForbiddenException);

    const isPasswordValid = PASSWORD_REGEX.test(signUpInput.password);
    assert(isPasswordValid, 'Password too weak', BadRequestException);

    const passwordHash = await hashPassword(signUpInput.password);

    if (signUpInput.workspaceInviteHash) {
      const workspace = await this.workspaceService.findFirst({
        where: {
          inviteHash: signUpInput.workspaceInviteHash,
        },
      });

      assert(
        workspace,
        'This workspace inviteHash is invalid',
        ForbiddenException,
      );

      return await this.userService.createUser(
        {
          data: {
            email: signUpInput.email,
            passwordHash,
            locale: 'en',
            settings: {
              create: {
                locale: 'en',
              },
            },
          },
        } as Prisma.UserCreateArgs,
        workspace.id,
      );
    }

    return await this.userService.createUser({
      data: {
        email: signUpInput.email,
        passwordHash,
        locale: 'en',
        settings: {
          create: {
            locale: 'en',
          },
        },
      },
    } as Prisma.UserCreateArgs);
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

  async checkWorkspaceInviteHashIsValid(
    inviteHash: string,
  ): Promise<WorkspaceInviteHashValid> {
    const workspace = await this.workspaceService.findFirst({
      where: {
        inviteHash,
      },
    });

    return { isValid: !!workspace };
  }
}
