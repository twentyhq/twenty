import { Module } from '@nestjs/common';

import { ApiKeyResolver } from './api-key.resolver';

@Module({
  providers: [ApiKeyResolver],
})
export class ApiKeyModule {}
