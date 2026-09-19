import { Module } from '@nestjs/common';

import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { AiClassificationService } from 'src/engine/metadata-modules/ai/ai-classification/ai-classification.service';
import { AiModelsModule } from 'src/engine/metadata-modules/ai/ai-models/ai-models.module';

@Module({
  imports: [AiModelsModule, AiBillingModule],
  providers: [AiClassificationService],
  exports: [AiClassificationService],
})
export class AiClassificationModule {}
