import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ObjectRecordDiff } from 'src/engine/core-modules/event-emitter/types/object-record-diff';
import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view/enums/view-filter-group-logical-operator';
import { ViewFilterGroup } from 'src/engine/metadata-modules/view/view-filter-group.entity';
import { ViewFilterGroupWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter-group.workspace-entity';

@Injectable()
export class ViewFilterGroupSyncService {
  constructor(
    @InjectRepository(ViewFilterGroup, 'core')
    private readonly coreViewFilterGroupRepository: Repository<ViewFilterGroup>,
  ) {}

  private parseUpdateDataFromDiff(
    diff: Partial<ObjectRecordDiff<ViewFilterGroupWorkspaceEntity>>,
  ): Partial<ViewFilterGroup> {
    const updateData: Record<string, unknown> = {};

    for (const key of Object.keys(diff)) {
      const diffValue = diff[key as keyof ViewFilterGroupWorkspaceEntity];

      if (isDefined(diffValue)) {
        if (key === 'logicalOperator') {
          updateData[key] = diffValue.after as ViewFilterGroupLogicalOperator;
        } else {
          updateData[key] = diffValue.after;
        }
      }
    }

    return updateData as Partial<ViewFilterGroup>;
  }

  public async createCoreViewFilterGroup(
    workspaceId: string,
    workspaceViewFilterGroup: ViewFilterGroupWorkspaceEntity,
  ): Promise<void> {
    const coreViewFilterGroup: Partial<ViewFilterGroup> = {
      id: workspaceViewFilterGroup.id,
      viewId: workspaceViewFilterGroup.viewId,
      logicalOperator:
        workspaceViewFilterGroup.logicalOperator as ViewFilterGroupLogicalOperator,
      parentViewFilterGroupId: workspaceViewFilterGroup.parentViewFilterGroupId,
      positionInViewFilterGroup:
        workspaceViewFilterGroup.positionInViewFilterGroup,
      workspaceId,
      createdAt: new Date(workspaceViewFilterGroup.createdAt),
      updatedAt: new Date(workspaceViewFilterGroup.updatedAt),
      deletedAt: workspaceViewFilterGroup.deletedAt
        ? new Date(workspaceViewFilterGroup.deletedAt)
        : null,
    };

    await this.coreViewFilterGroupRepository.save(coreViewFilterGroup);
  }

  public async updateCoreViewFilterGroup(
    workspaceId: string,
    workspaceViewFilterGroup: Pick<ViewFilterGroupWorkspaceEntity, 'id'>,
    diff?: Partial<ObjectRecordDiff<ViewFilterGroupWorkspaceEntity>>,
  ): Promise<void> {
    if (!diff || Object.keys(diff).length === 0) {
      return;
    }

    const updateData = this.parseUpdateDataFromDiff(diff);

    if (Object.keys(updateData).length > 0) {
      await this.coreViewFilterGroupRepository.update(
        { id: workspaceViewFilterGroup.id, workspaceId },
        updateData,
      );
    }
  }

  public async deleteCoreViewFilterGroup(
    workspaceId: string,
    workspaceViewFilterGroup: Pick<ViewFilterGroupWorkspaceEntity, 'id'>,
  ): Promise<void> {
    await this.coreViewFilterGroupRepository.softDelete({
      id: workspaceViewFilterGroup.id,
      workspaceId,
    });
  }

  public async destroyCoreViewFilterGroup(
    workspaceId: string,
    workspaceViewFilterGroup: Pick<ViewFilterGroupWorkspaceEntity, 'id'>,
  ): Promise<void> {
    await this.coreViewFilterGroupRepository.delete({
      id: workspaceViewFilterGroup.id,
      workspaceId,
    });
  }

  public async restoreCoreViewFilterGroup(
    workspaceId: string,
    workspaceViewFilterGroup: ViewFilterGroupWorkspaceEntity,
  ): Promise<void> {
    await this.coreViewFilterGroupRepository.restore({
      id: workspaceViewFilterGroup.id,
      workspaceId,
    });
  }
}
