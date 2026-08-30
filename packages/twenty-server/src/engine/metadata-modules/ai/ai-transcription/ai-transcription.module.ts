import { Module } from '@nestjs/common';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { AiTranscribeController } from 'src/engine/metadata-modules/ai/ai-transcription/controllers/ai-transcribe.controller';
import { AiTranscriptionService } from 'src/engine/metadata-modules/ai/ai-transcription/services/ai-transcription.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    TokenModule,
    WorkspaceCacheStorageModule,
    PermissionsModule,
    BillingModule,
    AiBillingModule,
  ],
  controllers: [AiTranscribeController],
  providers: [AiTranscriptionService],
  exports: [AiTranscriptionService],
})
export class AiTranscriptionModule {}
