import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  BadRequestException,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';

import {
  PrismaSelect,
  PrismaSelector,
} from 'src/decorators/prisma-select.decorator';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { AuthUser } from 'src/decorators/auth-user.decorator';
import { assert } from 'src/utils/assert';
import { User } from 'src/core/@generated/user/user.model';

import { AuthTokens } from './dto/token.entity';
import { TokenService } from './services/token.service';
import { RefreshTokenInput } from './dto/refresh-token.input';
import { Verify } from './dto/verify.entity';
import { VerifyInput } from './dto/verify.input';
import { AuthService } from './services/auth.service';
import { LoginToken } from './dto/login-token.entity';
import { ChallengeInput } from './dto/challenge.input';
import { UserExists } from './dto/user-exists.entity';
import { CheckUserExistsInput } from './dto/user-exists.input';
import { WorkspaceInviteHashValid } from './dto/workspace-invite-hash-valid.entity';
import { WorkspaceInviteHashValidInput } from './dto/workspace-invite-hash.input';
import { SignUpInput } from './dto/sign-up.input';
import { ImpersonateInput } from './dto/impersonate.input';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
  ) {}

  @Query(() => UserExists)
  async checkUserExists(
    @Args() checkUserExistsInput: CheckUserExistsInput,
  ): Promise<UserExists> {
    const { exists } = await this.authService.checkUserExists(
      checkUserExistsInput.email,
    );
    return { exists };
  }

  @Query(() => WorkspaceInviteHashValid)
  async checkWorkspaceInviteHashIsValid(
    @Args() workspaceInviteHashValidInput: WorkspaceInviteHashValidInput,
  ): Promise<WorkspaceInviteHashValid> {
    return await this.authService.checkWorkspaceInviteHashIsValid(
      workspaceInviteHashValidInput.inviteHash,
    );
  }

  @Mutation(() => LoginToken)
  async challenge(@Args() challengeInput: ChallengeInput): Promise<LoginToken> {
    const user = await this.authService.challenge(challengeInput);
    const loginToken = await this.tokenService.generateLoginToken(user.email);

    return { loginToken };
  }

  @Mutation(() => LoginToken)
  async signUp(@Args() signUpInput: SignUpInput): Promise<LoginToken> {
    const user = await this.authService.signUp(signUpInput);
    const loginToken = await this.tokenService.generateLoginToken(user.email);

    return { loginToken };
  }

  @Mutation(() => Verify)
  async verify(
    @Args() verifyInput: VerifyInput,
    @PrismaSelector({
      modelName: 'User',
      defaultFields: { User: { id: true } },
    })
    prismaSelect: PrismaSelect<'User'>,
  ): Promise<Verify> {
    const email = await this.tokenService.verifyLoginToken(
      verifyInput.loginToken,
    );
    const select = prismaSelect.valueOf('user') as Prisma.UserSelect & {
      id: true;
    };
    const result = await this.authService.verify(email, select);

    return result;
  }

  @Mutation(() => AuthTokens)
  async renewToken(@Args() args: RefreshTokenInput): Promise<AuthTokens> {
    if (!args.refreshToken) {
      throw new BadRequestException('Refresh token is mendatory');
    }

    const tokens = await this.tokenService.generateTokensFromRefreshToken(
      args.refreshToken,
    );

    return { tokens: tokens };
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Verify)
  async impersonate(
    @Args() impersonateInput: ImpersonateInput,
    @AuthUser() user: User,
    @PrismaSelector({
      modelName: 'User',
      defaultFields: {
        User: {
          id: true,
          workspaceMember: { select: { allowImpersonation: true } },
        },
      },
    })
    prismaSelect: PrismaSelect<'User'>,
  ): Promise<Verify> {
    // Check if user can impersonate
    assert(user.canImpersonate, 'User cannot impersonate', ForbiddenException);
    const select = prismaSelect.valueOf('user') as Prisma.UserSelect & {
      id: true;
      workspaceMember: { select: { allowImpersonation: true } };
    };

    return this.authService.impersonate(impersonateInput.userId, select);
  }
}
