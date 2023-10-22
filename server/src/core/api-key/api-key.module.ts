import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { TokenService } from 'src/core/auth/services/token.service';
import { AbilityModule } from 'src/ability/ability.module';
import { PrismaModule } from 'src/database/prisma.module';

import { ApiKeyResolver } from './api-key.resolver';
import { ApiKeyService } from './api-key.service';

@Module({
  imports: [AbilityModule, PrismaModule],
  providers: [ApiKeyResolver, ApiKeyService, TokenService, JwtService],
})
export class ApiKeyModule {}
