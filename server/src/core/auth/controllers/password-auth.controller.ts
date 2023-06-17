import { Body, Controller, Post } from '@nestjs/common';
import { ChallengeInput } from '../dto/challenge.input';
import { AuthService } from '../services/auth.service';
import { LoginTokenEntity } from '../dto/login-token.entity';
import { TokenService } from '../services/token.service';

@Controller('auth/password')
export class PasswordAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post()
  async challenge(
    @Body() challengeInput: ChallengeInput,
  ): Promise<LoginTokenEntity> {
    const user = await this.authService.challenge(challengeInput);
    const loginToken = await this.tokenService.generateLoginToken(user.email);

    return { loginToken };
  }
}
