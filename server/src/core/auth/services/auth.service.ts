import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ChallengeInput } from 'src/core/auth/dto/challenge.input';
import { assert } from 'src/utils/assert';
import {
  PASSWORD_REGEX,
  compareHash,
  hashPassword,
} from 'src/core/auth/auth.util';
import { Verify } from 'src/core/auth/dto/verify.entity';
import { UserExists } from 'src/core/auth/dto/user-exists.entity';
import { WorkspaceInviteHashValid } from 'src/core/auth/dto/workspace-invite-hash-valid.entity';
import { SignUpInput } from 'src/core/auth/dto/sign-up.input';
import { User } from 'src/core/user/user.entity';
import { Workspace } from 'src/core/workspace/workspace.entity';

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
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async challenge(challengeInput: ChallengeInput) {
    const user = await this.userRepository.findOneBy({
      email: challengeInput.email,
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
    const existingUser = await this.userRepository.findOneBy({
      email: signUpInput.email,
    });
    assert(!existingUser, 'This user already exists', ForbiddenException);

    const isPasswordValid = PASSWORD_REGEX.test(signUpInput.password);
    assert(isPasswordValid, 'Password too weak', BadRequestException);

    const passwordHash = await hashPassword(signUpInput.password);

    if (signUpInput.workspaceInviteHash) {
      const workspace = await this.workspaceRepository.findOneBy({
        inviteHash: signUpInput.workspaceInviteHash,
      });

      assert(
        workspace,
        'This workspace inviteHash is invalid',
        ForbiddenException,
      );

      return await this.userRepository.create({
        email: signUpInput.email,
        passwordHash,
      });
    }

    return await this.userRepository.create({
      email: signUpInput.email,
      passwordHash,
    });
  }

  async verify(email: string): Promise<Verify> {
    const user = await this.userRepository.findOneBy({
      email,
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
    const user = await this.userRepository.findOneBy({
      email,
    });

    return { exists: !!user };
  }

  async checkWorkspaceInviteHashIsValid(
    inviteHash: string,
  ): Promise<WorkspaceInviteHashValid> {
    const workspace = await this.workspaceRepository.findOneBy({
      inviteHash,
    });

    return { isValid: !!workspace };
  }

  async impersonate(userId: string) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    assert(user, "This user doesn't exist", NotFoundException);

    // Todo: check if workspace member can be impersonated

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
