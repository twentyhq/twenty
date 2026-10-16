import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type AiDataPolicy } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

@Injectable()
export class WorkspaceAiDataPolicyService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  // throws rather than defaulting, since a missing policy would read as "no restriction"
  async getAiDataPolicy(workspaceId: string): Promise<AiDataPolicy> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      select: {
        id: true,
        aiDataResidency: true,
        isAiZeroDataRetentionRequired: true,
      },
    });

    if (!isDefined(workspace)) {
      throw new AiException(
        `Workspace ${workspaceId} not found`,
        AiExceptionCode.WORKSPACE_NOT_FOUND,
      );
    }

    return {
      aiDataResidency: workspace.aiDataResidency,
      isAiZeroDataRetentionRequired: workspace.isAiZeroDataRetentionRequired,
    };
  }
}
