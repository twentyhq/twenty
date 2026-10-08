import { Module } from '@nestjs/common';

import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { AiEvaluationService } from 'src/engine/metadata-modules/ai/ai-evaluation/services/ai-evaluation.service';
import { NativeEvaluationRunner } from 'src/engine/metadata-modules/ai/ai-evaluation/services/native-evaluation.runner';

@Module({
  imports: [AiBillingModule],
  providers: [NativeEvaluationRunner, AiEvaluationService],
  exports: [AiEvaluationService],
})
export class AiEvaluationModule {}
