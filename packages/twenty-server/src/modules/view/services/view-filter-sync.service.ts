import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ObjectRecordDiff } from 'src/engine/core-modules/event-emitter/types/object-record-diff';
import { ViewFilter } from 'src/engine/metadata-modules/view/view-filter.entity';
import { ViewFilterWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter.workspace-entity';
import { transformViewFilterWorkspaceValueToCoreValue } from 'src/modules/view/utils/transform-view-filter-workspace-value-to-core-value';

@Injectable()
export class ViewFilterSyncService {
  constructor(
    @InjectRepository(ViewFilter, 'core')
    private readonly coreViewFilterRepository: Repository<ViewFilter>,
  ) {}

  private parseUpdateDataFromDiff(
    diff: Partial<ObjectRecordDiff<ViewFilterWorkspaceEntity>>,
  ): Partial<ViewFilter> {
    const updateData: Record<string, unknown> = {};

    for (const key of Object.keys(diff)) {
      if (key === 'displayValue') {
        continue;
      }

      const diffValue = diff[key as keyof ViewFilterWorkspaceEntity];

      if (isDefined(diffValue)) {
        if (key === 'value' && typeof diffValue.after === 'string') {
          updateData[key] = transformViewFilterWorkspaceValueToCoreValue(
            diffValue.after,
          );
        } else {
          updateData[key] = diffValue.after;
        }
      }
    }

    return updateData as Partial<ViewFilter>;
  }

  public async createCoreViewFilter(
    workspaceId: string,
    workspaceViewFilter: ViewFilterWorkspaceEntity,
  ): Promise<void> {
    if (!workspaceViewFilter.viewId) {
      return;
    }

    const coreViewFilter: Partial<ViewFilter> = {
      id: workspaceViewFilter.id,
      fieldMetadataId: workspaceViewFilter.fieldMetadataId,
      viewId: workspaceViewFilter.viewId,
      operand: workspaceViewFilter.operand,
      value: transformViewFilterWorkspaceValueToCoreValue(
        workspaceViewFilter.value,
      ),
      viewFilterGroupId: workspaceViewFilter.viewFilterGroupId,
      workspaceId,
      createdAt: new Date(workspaceViewFilter.createdAt),
      updatedAt: new Date(workspaceViewFilter.updatedAt),
      deletedAt: workspaceViewFilter.deletedAt
        ? new Date(workspaceViewFilter.deletedAt)
        : null,
    };

    await this.coreViewFilterRepository.save(coreViewFilter);
  }

  public async updateCoreViewFilter(
    workspaceId: string,
    workspaceViewFilter: ViewFilterWorkspaceEntity,
    diff?: Partial<ObjectRecordDiff<ViewFilterWorkspaceEntity>>,
  ): Promise<void> {
    if (!workspaceViewFilter.viewId) {
      return;
    }

    if (!diff || Object.keys(diff).length === 0) {
      return;
    }

    const updateData = this.parseUpdateDataFromDiff(diff);

    if (Object.keys(updateData).length > 0) {
      await this.coreViewFilterRepository.update(
        { id: workspaceViewFilter.id, workspaceId },
        updateData,
      );
    }
  }

  public async deleteCoreViewFilter(
    workspaceId: string,
    workspaceViewFilter: Pick<ViewFilterWorkspaceEntity, 'id'>,
  ): Promise<void> {
    await this.coreViewFilterRepository.softDelete({
      id: workspaceViewFilter.id,
      workspaceId,
    });
  }

  public async destroyCoreViewFilter(
    workspaceId: string,
    workspaceViewFilter: Pick<ViewFilterWorkspaceEntity, 'id'>,
  ): Promise<void> {
    await this.coreViewFilterRepository.delete({
      id: workspaceViewFilter.id,
      workspaceId,
    });
  }

  public async restoreCoreViewFilter(
    workspaceId: string,
    workspaceViewFilter: Pick<ViewFilterWorkspaceEntity, 'id'>,
  ): Promise<void> {
    await this.coreViewFilterRepository.restore({
      id: workspaceViewFilter.id,
      workspaceId,
    });
  }
}
