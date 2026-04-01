import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PipelineWorkspaceEntity } from 'src/modules/pipeline/standard-objects/pipeline.workspace-entity';
import { STAGE_PROBABILITIES, DEFAULT_STAGES } from 'src/modules/pipeline/constants/pipeline.constant';

@Injectable()
export class PipelineService {
  constructor(
    @InjectRepository(PipelineWorkspaceEntity, 'core')
    private readonly pipelineRepository: Repository<PipelineWorkspaceEntity>,
  ) {}

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

  async createDefaultPipeline(workspaceId: string): Promise<PipelineWorkspaceEntity> {
    const pipeline = this.pipelineRepository.create({
      name: 'Pipeline Principal',
      type: 'NEW_BUSINESS',
      description: 'Pipeline de ventas principal',
      isDefault: true,
      isActive: true,
      position: 0,
    });
    return this.pipelineRepository.save(pipeline);
  }
}
