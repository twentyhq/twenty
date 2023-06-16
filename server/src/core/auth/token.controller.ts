import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { RefreshTokenInput } from './dto/refresh-token.input';

@Controller('auth/token')
export class TokenController {
  constructor(private authService: AuthService) {}

  @Post()
  async generateAccessToken(@Body() body: RefreshTokenInput) {
    if (!body.refreshToken) {
      throw new BadRequestException('Refresh token is mendatory');
    }

    const tokens = await this.authService.generateTokensFromRefreshToken(
      body.refreshToken,
    );

    return tokens;
  }
}
