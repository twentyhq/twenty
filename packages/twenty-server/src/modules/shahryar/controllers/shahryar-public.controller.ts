import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { type AuthTokens } from 'src/engine/core-modules/auth/dto/auth-tokens.dto';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { ShahryarMobileUsernameLoginRequestDTO } from 'src/modules/shahryar/dtos/shahryar-mobile-auth.dto';
import { ShahryarMobileAuthService } from 'src/modules/shahryar/services/shahryar-mobile-auth.service';

@Controller('rest/shahryar')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class ShahryarPublicController {
  constructor(
    private readonly shahryarMobileAuthService: ShahryarMobileAuthService,
  ) {}

  @Post('mobile/auth/login')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async signInWithUsername(
    @Body() request: ShahryarMobileUsernameLoginRequestDTO,
  ): Promise<AuthTokens> {
    return await this.shahryarMobileAuthService.signInWithUsername(request);
  }
}
