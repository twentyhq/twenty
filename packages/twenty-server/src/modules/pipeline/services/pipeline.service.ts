import { Injectable, Logger } from '@nestjs/common';

import { DEFAULT_STAGES, STAGE_PROBABILITIES } from 'src/modules/pipeline/constants/pipeline.constant';

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);

  async getDefaultStages(): Promise<typeof DEFAULT_STAGES> {
    return DEFAULT_STAGES;
  }

  getProbabilityForStage(stage: string): number {
    return STAGE_PROBABILITIES[stage] ?? 10;
  }

  calculateWeightedAmount(amount: number | null, stage: string): number {
    if (!amount) return 0;
    const probability = this.getProbabilityForStage(stage) / 100;
    return Math.round(amount * probability);
  }

  calculateStageAging(stageChangedAt: Date | null): number {
    if (!stageChangedAt) return 0;
    const now = new Date();
    const diff = now.getTime() - new Date(stageChangedAt).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  async createDefaultPipeline(workspaceId: string): Promise<{ name: string; isDefault: boolean }> {
    this.logger.log(`Creating default pipeline for workspace ${workspaceId}`);
    return { name: 'Pipeline Principal', isDefault: true };
  }
}
