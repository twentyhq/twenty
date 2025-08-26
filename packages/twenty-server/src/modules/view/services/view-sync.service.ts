import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type ObjectRecordDiff } from 'src/engine/core-modules/event-emitter/types/object-record-diff';
import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { ViewKey } from 'src/engine/core-modules/view/enums/view-key.enum';
import { ViewOpenRecordIn } from 'src/engine/core-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/core-modules/view/enums/view-type.enum';
import { type ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

@Injectable()
export class ViewSyncService {
  constructor(
    @InjectRepository(ViewEntity, 'core')
    private readonly coreViewRepository: Repository<ViewEntity>,
  ) {}

  private parseUpdateDataFromDiff(
    diff: Partial<ObjectRecordDiff<ViewWorkspaceEntity>>,
  ): Partial<ViewEntity> {
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
        } else if (key === 'type') {
          updateData[key] =
            diffValue.after === 'table' ? ViewType.TABLE : ViewType.KANBAN;
        } else if (key === 'key') {
          updateData[key] =
            diffValue.after === 'INDEX' || diffValue.after === ViewKey.INDEX
              ? ViewKey.INDEX
              : null;
        } else {
          updateData[key] = diffValue.after;
        }
      }
    }

    return updateData as Partial<ViewEntity>;
  }

  public async createCoreView(
    workspaceId: string,
    workspaceView: ViewWorkspaceEntity,
  ): Promise<void> {
    let viewName = workspaceView.name;

    if (workspaceView.key === 'INDEX') {
      // All INDEX views use the template for consistency
      viewName = 'All {objectLabelPlural}';
    }

    const coreView: Partial<ViewEntity> = {
      id: workspaceView.id,
      name: viewName,
      objectMetadataId: workspaceView.objectMetadataId,
      type: workspaceView.type === 'table' ? ViewType.TABLE : ViewType.KANBAN,
      key:
        workspaceView.key === 'INDEX' || workspaceView.key === ViewKey.INDEX
          ? ViewKey.INDEX
          : null,
      icon: workspaceView.icon,
      position: workspaceView.position,
      isCompact: workspaceView.isCompact,
      isCustom: workspaceView.key !== 'INDEX',
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
