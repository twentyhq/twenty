import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { ViewOpenRecordIn } from 'src/engine/metadata-modules/view/enums/view-open-record-in';
import { View } from 'src/engine/metadata-modules/view/view.entity';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

@Injectable()
export class ViewSyncService {
  constructor(
    @InjectRepository(View, 'core')
    private readonly coreViewRepository: Repository<View>,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  public async isFeatureFlagEnabled(workspaceId: string): Promise<boolean> {
    const featureFlags =
      await this.featureFlagService.getWorkspaceFeatureFlagsMap(workspaceId);

    return featureFlags?.IS_CORE_VIEW_SYNCING_ENABLED ?? false;
  }

  public async createCoreView(
    workspaceId: string,
    workspaceView: ViewWorkspaceEntity,
  ): Promise<void> {
    const coreView = {
      id: workspaceView.id,
      name: workspaceView.name,
      objectMetadataId: workspaceView.objectMetadataId,
      type: workspaceView.type,
      key: workspaceView.key,
      icon: workspaceView.icon,
      position: workspaceView.position,
      isCompact: workspaceView.isCompact,
      openRecordIn:
        workspaceView.openRecordIn === 'SIDE_PANEL'
          ? ViewOpenRecordIn.SIDE_PANEL
          : ViewOpenRecordIn.RECORD_PAGE,
      kanbanAggregateOperation: workspaceView.kanbanAggregateOperation,
      kanbanAggregateOperationFieldMetadataId:
        workspaceView.kanbanAggregateOperationFieldMetadataId,
      workspaceId,
      createdAt: new Date(workspaceView.createdAt),
      updatedAt: new Date(workspaceView.updatedAt),
      deletedAt: workspaceView.deletedAt
        ? new Date(workspaceView.deletedAt)
        : null,
    };

    await this.coreViewRepository.save(coreView);
  }

  public async updateCoreView(
    workspaceId: string,
    workspaceView: ViewWorkspaceEntity,
  ): Promise<void> {
    const updateData = {
      name: workspaceView.name,
      objectMetadataId: workspaceView.objectMetadataId,
      type: workspaceView.type,
      key: workspaceView.key,
      icon: workspaceView.icon,
      position: workspaceView.position,
      isCompact: workspaceView.isCompact,
      openRecordIn:
        workspaceView.openRecordIn === 'SIDE_PANEL'
          ? ViewOpenRecordIn.SIDE_PANEL
          : ViewOpenRecordIn.RECORD_PAGE,
      kanbanAggregateOperation: workspaceView.kanbanAggregateOperation,
      kanbanAggregateOperationFieldMetadataId:
        workspaceView.kanbanAggregateOperationFieldMetadataId,
      updatedAt: new Date(workspaceView.updatedAt),
      deletedAt: workspaceView.deletedAt
        ? new Date(workspaceView.deletedAt)
        : null,
    };

    await this.coreViewRepository.update(
      { id: workspaceView.id, workspaceId },
      updateData,
    );
  }

  public async deleteCoreView(
    workspaceId: string,
    workspaceView: ViewWorkspaceEntity,
  ): Promise<void> {
    await this.coreViewRepository.softDelete({
      id: workspaceView.id,
      workspaceId,
    });
  }

  public async restoreCoreView(
    workspaceId: string,
    workspaceView: ViewWorkspaceEntity,
  ): Promise<void> {
    await this.coreViewRepository.restore({
      id: workspaceView.id,
      workspaceId,
    });
  }
}
