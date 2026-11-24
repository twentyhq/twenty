import { Module } from '@nestjs/common';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';
import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { AiSearchAnswerController } from 'src/engine/metadata-modules/ai/ai-search-answer/controllers/ai-search-answer.controller';
import { AiSearchAnswerService } from 'src/engine/metadata-modules/ai/ai-search-answer/services/ai-search-answer.service';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    TokenModule,
    WorkspaceCacheStorageModule,
    PermissionsModule,
    AiBillingModule,
    RecordCrudModule,
  ],
  controllers: [AiSearchAnswerController],
  providers: [AiSearchAnswerService],
})
export class AiSearchAnswerModule {}
