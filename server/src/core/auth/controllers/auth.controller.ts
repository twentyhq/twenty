import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { VerifyInput } from '../dto/verify.input';
import { VerifyEntity } from '../dto/verify.entity';
import { TokenService } from '../services/token.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('verify')
  async verify(@Body() verifyInput: VerifyInput): Promise<VerifyEntity> {
    const email = await this.tokenService.verifyLoginToken(
      verifyInput.loginToken,
    );
    const result = await this.authService.verify(email);

    return result;
  }
}
