import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceSyncContext } from 'src/workspace/workspace-sync-metadata/interfaces/workspace-sync-context.interface';
import { FeatureFlagMap } from 'src/core/feature-flag/interfaces/feature-flag-map.interface';

import { FeatureFlagEntity } from 'src/core/feature-flag/feature-flag.entity';

@Injectable()
export class FeatureFlagFactory {
  constructor(
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  async create(context: WorkspaceSyncContext): Promise<FeatureFlagMap> {
    const workspaceFeatureFlags = await this.featureFlagRepository.find({
      where: { workspaceId: context.workspaceId },
    });

    const workspaceFeatureFlagsMap = workspaceFeatureFlags.reduce(
      (result, currentFeatureFlag) => {
        result[currentFeatureFlag.key] = currentFeatureFlag.value;

        return result;
      },
      {} as FeatureFlagMap,
    );

    return workspaceFeatureFlagsMap;
  }
}
