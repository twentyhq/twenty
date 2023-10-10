import { Module } from '@nestjs/common';

import { ApiKeyResolver } from './api-key.resolver';
import { ApiKeyService } from './api-key.service';

@Module({
  providers: [ApiKeyResolver, ApiKeyService],
})
export class ApiKeyModule {}
