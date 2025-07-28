import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ObjectRecordDiff } from 'src/engine/core-modules/event-emitter/types/object-record-diff';
import { ViewOpenRecordIn } from 'src/engine/metadata-modules/view/enums/view-open-record-in';
import { View } from 'src/engine/metadata-modules/view/view.entity';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

@Injectable()
export class ViewSyncService {
  constructor(
    @InjectRepository(View, 'core')
    private readonly coreViewRepository: Repository<View>,
  ) {}

  private parseUpdateDataFromDiff(
    diff: Partial<ObjectRecordDiff<ViewWorkspaceEntity>>,
  ): Partial<View> {
    const updateData: Record<string, unknown> = {};

    for (const key of Object.keys(diff)) {
      if (key === 'kanbanFieldMetadataId') {
        continue;
      }

      const diffValue = diff[key as keyof ViewWorkspaceEntity];

      if (isDefined(diffValue)) {
        if (key === 'openRecordIn') {
          updateData[key] =
            diffValue.after === 'SIDE_PANEL'
              ? ViewOpenRecordIn.SIDE_PANEL
              : ViewOpenRecordIn.RECORD_PAGE;
        } else {
          updateData[key] = diffValue.after;
        }
      }
    }

    return updateData as Partial<View>;
  }

  public async createCoreView(
    workspaceId: string,
    workspaceView: ViewWorkspaceEntity,
  ): Promise<void> {
    const coreView: Partial<View> = {
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
    diff?: Partial<ObjectRecordDiff<ViewWorkspaceEntity>>,
  ): Promise<void> {
    if (!diff || Object.keys(diff).length === 0) {
      return;
    }

    const updateData = this.parseUpdateDataFromDiff(diff);

    if (Object.keys(updateData).length > 0) {
      await this.coreViewRepository.update(
        { id: workspaceView.id, workspaceId },
        updateData,
      );
    }
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

  public async destroyCoreView(
    workspaceId: string,
    workspaceView: ViewWorkspaceEntity,
  ): Promise<void> {
    await this.coreViewRepository.delete({
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
