import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type ObjectRecordDiff } from 'src/engine/core-modules/event-emitter/types/object-record-diff';
import { ViewSortEntity } from 'src/engine/core-modules/view/entities/view-sort.entity';
import { type ViewSortDirection } from 'src/engine/core-modules/view/enums/view-sort-direction';
import { type ViewSortWorkspaceEntity } from 'src/modules/view/standard-objects/view-sort.workspace-entity';

@Injectable()
export class ViewSortSyncService {
  constructor(
    @InjectRepository(ViewSortEntity)
    private readonly coreViewSortRepository: Repository<ViewSortEntity>,
  ) {}

  private parseUpdateDataFromDiff(
    diff: Partial<ObjectRecordDiff<ViewSortWorkspaceEntity>>,
  ): Partial<ViewSortEntity> {
    const updateData: Record<string, unknown> = {};

    for (const key of Object.keys(diff)) {
      const diffValue = diff[key as keyof ViewSortWorkspaceEntity];

      if (isDefined(diffValue)) {
        if (key === 'direction') {
          updateData[key] = (
            diffValue.after as string
          ).toUpperCase() as ViewSortDirection;
        } else {
          updateData[key] = diffValue.after;
        }
      }
    }

    return updateData as Partial<ViewSortEntity>;
  }

  public async createCoreViewSort(
    workspaceId: string,
    workspaceViewSort: ViewSortWorkspaceEntity,
  ): Promise<void> {
    if (!workspaceViewSort.viewId) {
      return;
    }

    const direction =
      workspaceViewSort.direction.toUpperCase() as ViewSortDirection;

    const coreViewSort: Partial<ViewSortEntity> = {
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
    diff?: Partial<ObjectRecordDiff<ViewSortWorkspaceEntity>>,
  ): Promise<void> {
    if (!workspaceViewSort.viewId) {
      return;
    }

    if (!diff || Object.keys(diff).length === 0) {
      return;
    }

    const updateData = this.parseUpdateDataFromDiff(diff);

    if (Object.keys(updateData).length > 0) {
      await this.coreViewSortRepository.update(
        { id: workspaceViewSort.id, workspaceId },
        updateData,
      );
    }
  }

  public async deleteCoreViewSort(
    workspaceId: string,
    workspaceViewSort: Pick<ViewSortWorkspaceEntity, 'id'>,
  ): Promise<void> {
    await this.coreViewSortRepository.softDelete({
      id: workspaceViewSort.id,
      workspaceId,
    });
  }

  public async destroyCoreViewSort(
    workspaceId: string,
    workspaceViewSort: Pick<ViewSortWorkspaceEntity, 'id'>,
  ): Promise<void> {
    await this.coreViewSortRepository.delete({
      id: workspaceViewSort.id,
      workspaceId,
    });
  }

  public async restoreCoreViewSort(
    workspaceId: string,
    workspaceViewSort: Pick<ViewSortWorkspaceEntity, 'id'>,
  ): Promise<void> {
    await this.coreViewSortRepository.restore({
      id: workspaceViewSort.id,
      workspaceId,
    });
  }
}
