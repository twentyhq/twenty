import { Body, Controller, Post } from '@nestjs/common';
import { ChallengeInput } from './dto/challenge.input';
import { AuthService } from './services/auth.service';
import { LoginTokenEntity } from './dto/login-token.entity';
import { VerifyInput } from './dto/verify.input';
import { VerifyEntity } from './dto/verify.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('password')
  async challenge(
    @Body() challengeInput: ChallengeInput,
  ): Promise<LoginTokenEntity> {
    const user = await this.authService.challenge(challengeInput);
    const loginToken = await this.authService.generateLoginToken(user.email);

    return { loginToken };
  }

  @Post('verify')
  async verify(@Body() verifyInput: VerifyInput): Promise<VerifyEntity> {
    const email = await this.authService.verifyLoginToken(
      verifyInput.loginToken,
    );
    const result = await this.authService.verify(email);

    return result;
  }
}
