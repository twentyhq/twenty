import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { RefreshTokenInput } from '../dto/refresh-token.input';
import { TokenService } from '../services/token.service';

@Controller('auth/token')
export class TokenController {
  constructor(private tokenService: TokenService) {}

  @Post()
  async generateAccessToken(@Body() body: RefreshTokenInput) {
    if (!body.refreshToken) {
      throw new BadRequestException('Refresh token is mendatory');
    }

    const tokens = await this.tokenService.generateTokensFromRefreshToken(
      body.refreshToken,
    );

    return { tokens: tokens };
  }
}
