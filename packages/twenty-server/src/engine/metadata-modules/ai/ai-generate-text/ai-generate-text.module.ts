import { Module } from '@nestjs/common';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { UsageLimitModule } from 'src/engine/core-modules/usage-limit/usage-limit.module';
import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

import { AiGenerateTextController } from './controllers/ai-generate-text.controller';

@Module({
  imports: [
    TokenModule,
    WorkspaceCacheStorageModule,
    PermissionsModule,
    BillingModule,
    UsageLimitModule,
    AiBillingModule,
  ],
  controllers: [AiGenerateTextController],
})
export class AiGenerateTextModule {}
