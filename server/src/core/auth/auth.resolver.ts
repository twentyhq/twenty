import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthTokens } from './dto/token.entity';
import { TokenService } from './services/token.service';
import { RefreshTokenInput } from './dto/refresh-token.input';
import { BadRequestException } from '@nestjs/common';
import { Verify } from './dto/verify.entity';
import { VerifyInput } from './dto/verify.input';
import { AuthService } from './services/auth.service';
import { LoginToken } from './dto/login-token.entity';
import { ChallengeInput } from './dto/challenge.input';
import {
  PrismaSelect,
  PrismaSelector,
} from 'src/decorators/prisma-select.decorator';
import { Prisma } from '@prisma/client';
import { UserExists } from './dto/user-exists.entity';
import { CheckUserExistsInput } from './dto/user-exists.input';

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

  @Mutation(() => LoginToken)
  async challenge(@Args() challengeInput: ChallengeInput): Promise<LoginToken> {
    const user = await this.authService.challenge(challengeInput);
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
}
