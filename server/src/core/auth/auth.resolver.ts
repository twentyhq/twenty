import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  BadRequestException,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { AuthUser } from 'src/decorators/auth-user.decorator';
import { assert } from 'src/utils/assert';
import { Workspace } from 'src/core/workspace/workspace.entity';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { User } from 'src/core/user/user.entity';
import { ApiKeyTokenInput } from 'src/core/auth/dto/api-key-token.input';
import { TransientToken } from 'src/core/auth/dto/transient-token.entity';
import { UserService } from 'src/core/user/services/user.service';

import { ApiKeyToken, AuthTokens } from './dto/token.entity';
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
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private authService: AuthService,
    private tokenService: TokenService,
    private userService: UserService,
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

  @Query(() => Workspace)
  async findWorkspaceFromInviteHash(
    @Args() workspaceInviteHashValidInput: WorkspaceInviteHashValidInput,
  ) {
    return await this.workspaceRepository.findOneBy({
      inviteHash: workspaceInviteHashValidInput.inviteHash,
    });
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

  @Mutation(() => TransientToken)
  @UseGuards(JwtAuthGuard)
  async generateTransientToken(
    @AuthUser() user: User,
  ): Promise<TransientToken | void> {
    const workspaceMember = await this.userService.loadWorkspaceMember(user);
    const transientToken = await this.tokenService.generateTransientToken(
      workspaceMember.id,
      user.defaultWorkspace.id,
    );

    return { transientToken };
  }

  @Mutation(() => Verify)
  async verify(@Args() verifyInput: VerifyInput): Promise<Verify> {
    const email = await this.tokenService.verifyLoginToken(
      verifyInput.loginToken,
    );

    const result = await this.authService.verify(email);

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
  ): Promise<Verify> {
    // Check if user can impersonate
    assert(user.canImpersonate, 'User cannot impersonate', ForbiddenException);

    return this.authService.impersonate(impersonateInput.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => ApiKeyToken)
  async generateApiKeyToken(
    @Args() args: ApiKeyTokenInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ): Promise<ApiKeyToken | undefined> {
    return await this.tokenService.generateApiKeyToken(
      workspaceId,
      args.apiKeyId,
      args.expiresAt,
    );
  }
}
