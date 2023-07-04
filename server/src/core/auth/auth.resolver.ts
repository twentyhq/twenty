import { Args, Mutation, Resolver, Query} from '@nestjs/graphql';
import { AuthTokens, ClientConfig} from './dto/token.entity';
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

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
  ) {}

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

  @Query(() => ClientConfig)
  async clientConfig(): Promise<ClientConfig> {
    const displayGoogleLogin = process.env.AUTH_GOOGLE_CLIENT_ID !== undefined;
    const prefillLoginWithSeed = process.env.NODE_ENV === 'development';

    const clientConfig: ClientConfig = {
      display_google_login: displayGoogleLogin,
      prefill_login_with_seed: prefillLoginWithSeed,
    };

    return Promise.resolve(clientConfig);
  }
}