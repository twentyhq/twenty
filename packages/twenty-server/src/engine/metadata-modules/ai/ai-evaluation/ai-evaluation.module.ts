import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { AiEvaluationService } from 'src/engine/metadata-modules/ai/ai-evaluation/services/ai-evaluation.service';
import { LanguageModelEvaluationRunner } from 'src/engine/metadata-modules/ai/ai-evaluation/services/language-model-evaluation.runner';
import { NativeEvaluationRunner } from 'src/engine/metadata-modules/ai/ai-evaluation/services/native-evaluation.runner';
import { AiModelsModule } from 'src/engine/metadata-modules/ai/ai-models/ai-models.module';

@Module({
  imports: [
    AiModelsModule,
    AiBillingModule,
    TypeOrmModule.forFeature([WorkspaceEntity]),
  ],
  providers: [
    NativeEvaluationRunner,
    LanguageModelEvaluationRunner,
    AiEvaluationService,
  ],
  exports: [AiEvaluationService],
})
export class AiEvaluationModule {}
