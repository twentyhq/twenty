import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view/enums/view-filter-group-logical-operator';
import { ViewFilterGroup } from 'src/engine/metadata-modules/view/view-filter-group.entity';
import { ViewFilterGroupWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter-group.workspace-entity';

@Injectable()
export class ViewFilterGroupSyncService {
  constructor(
    @InjectRepository(ViewFilterGroup, 'core')
    private readonly coreViewFilterGroupRepository: Repository<ViewFilterGroup>,
  ) {}

  public async createCoreViewFilterGroup(
    workspaceId: string,
    workspaceViewFilterGroup: ViewFilterGroupWorkspaceEntity,
  ): Promise<void> {
    const coreViewFilterGroup = {
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
    workspaceViewFilterGroup: ViewFilterGroupWorkspaceEntity,
  ): Promise<void> {
    const updateData = {
      viewId: workspaceViewFilterGroup.viewId,
      logicalOperator:
        workspaceViewFilterGroup.logicalOperator as ViewFilterGroupLogicalOperator,
      parentViewFilterGroupId: workspaceViewFilterGroup.parentViewFilterGroupId,
      positionInViewFilterGroup:
        workspaceViewFilterGroup.positionInViewFilterGroup,
      updatedAt: new Date(workspaceViewFilterGroup.updatedAt),
      deletedAt: workspaceViewFilterGroup.deletedAt
        ? new Date(workspaceViewFilterGroup.deletedAt)
        : null,
    };

    await this.coreViewFilterGroupRepository.update(
      { id: workspaceViewFilterGroup.id, workspaceId },
      updateData,
    );
  }

  public async deleteCoreViewFilterGroup(
    workspaceId: string,
    workspaceViewFilterGroup: ViewFilterGroupWorkspaceEntity,
  ): Promise<void> {
    await this.coreViewFilterGroupRepository.softDelete({
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
