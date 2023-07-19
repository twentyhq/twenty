import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from 'src/core/auth/services/auth.service';
import { VerifyInput } from 'src/core/auth/dto/verify.input';
import { Verify } from 'src/core/auth/dto/verify.entity';
import { TokenService } from 'src/core/auth/services/token.service';

@Controller('auth/verify')
export class VerifyAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post()
  async verify(@Body() verifyInput: VerifyInput): Promise<Verify> {
    const email = await this.tokenService.verifyLoginToken(
      verifyInput.loginToken,
    );
    const result = await this.authService.verify(email, {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      emailVerified: true,
    });

    return result;
  }
}
