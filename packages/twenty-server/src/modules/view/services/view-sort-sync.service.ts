import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ViewSortDirection } from 'src/engine/metadata-modules/view/enums/view-sort-direction';
import { ViewSort } from 'src/engine/metadata-modules/view/view-sort.entity';
import { ViewSortWorkspaceEntity } from 'src/modules/view/standard-objects/view-sort.workspace-entity';

@Injectable()
export class ViewSortSyncService {
  constructor(
    @InjectRepository(ViewSort, 'core')
    private readonly coreViewSortRepository: Repository<ViewSort>,
  ) {}

  public async createCoreViewSort(
    workspaceId: string,
    workspaceViewSort: ViewSortWorkspaceEntity,
  ): Promise<void> {
    if (!workspaceViewSort.viewId) {
      return;
    }

    const direction =
      workspaceViewSort.direction.toUpperCase() as ViewSortDirection;

    const coreViewSort = {
      id: workspaceViewSort.id,
      fieldMetadataId: workspaceViewSort.fieldMetadataId,
      viewId: workspaceViewSort.viewId,
      direction: direction,
      workspaceId,
      createdAt: new Date(workspaceViewSort.createdAt),
      updatedAt: new Date(workspaceViewSort.updatedAt),
      deletedAt: workspaceViewSort.deletedAt
        ? new Date(workspaceViewSort.deletedAt)
        : null,
    };

    await this.coreViewSortRepository.save(coreViewSort);
  }

  public async updateCoreViewSort(
    workspaceId: string,
    workspaceViewSort: ViewSortWorkspaceEntity,
  ): Promise<void> {
    if (!workspaceViewSort.viewId) {
      return;
    }

    const direction =
      workspaceViewSort.direction.toUpperCase() as ViewSortDirection;

    const updateData = {
      fieldMetadataId: workspaceViewSort.fieldMetadataId,
      viewId: workspaceViewSort.viewId,
      direction: direction,
      updatedAt: new Date(workspaceViewSort.updatedAt),
      deletedAt: workspaceViewSort.deletedAt
        ? new Date(workspaceViewSort.deletedAt)
        : null,
    };

    await this.coreViewSortRepository.update(
      { id: workspaceViewSort.id, workspaceId },
      updateData,
    );
  }

  public async deleteCoreViewSort(
    workspaceId: string,
    workspaceViewSort: ViewSortWorkspaceEntity,
  ): Promise<void> {
    await this.coreViewSortRepository.softDelete({
      id: workspaceViewSort.id,
      workspaceId,
    });
  }

  public async restoreCoreViewSort(
    workspaceId: string,
    workspaceViewSort: ViewSortWorkspaceEntity,
  ): Promise<void> {
    await this.coreViewSortRepository.restore({
      id: workspaceViewSort.id,
      workspaceId,
    });
  }
}
