import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ViewFilter } from 'src/engine/metadata-modules/view/view-filter.entity';
import { ViewFilterWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter.workspace-entity';

@Injectable()
export class ViewFilterSyncService {
  constructor(
    @InjectRepository(ViewFilter, 'core')
    private readonly coreViewFilterRepository: Repository<ViewFilter>,
  ) {}

  public async createCoreViewFilter(
    workspaceId: string,
    workspaceViewFilter: ViewFilterWorkspaceEntity,
  ): Promise<void> {
    if (!workspaceViewFilter.viewId) {
      return;
    }

    let parsedValue: JSON;

    try {
      parsedValue = JSON.parse(workspaceViewFilter.value);
    } catch {
      throw new Error(
        `Could not parse value to JSON for view filter ${workspaceViewFilter.id}`,
      );
    }

    const coreViewFilter = {
      id: workspaceViewFilter.id,
      fieldMetadataId: workspaceViewFilter.fieldMetadataId,
      viewId: workspaceViewFilter.viewId,
      operand: workspaceViewFilter.operand,
      value: parsedValue,
      displayValue: workspaceViewFilter.displayValue,
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
  ): Promise<void> {
    if (!workspaceViewFilter.viewId) {
      return;
    }

    let parsedValue: JSON;

    try {
      parsedValue = JSON.parse(workspaceViewFilter.value);
    } catch {
      throw new Error(
        `Could not parse value to JSON for view filter ${workspaceViewFilter.id}`,
      );
    }

    const updateData = {
      fieldMetadataId: workspaceViewFilter.fieldMetadataId,
      viewId: workspaceViewFilter.viewId,
      operand: workspaceViewFilter.operand,
      value: parsedValue,
      displayValue: workspaceViewFilter.displayValue,
      viewFilterGroupId: workspaceViewFilter.viewFilterGroupId,
      updatedAt: new Date(workspaceViewFilter.updatedAt),
      deletedAt: workspaceViewFilter.deletedAt
        ? new Date(workspaceViewFilter.deletedAt)
        : null,
    };

    await this.coreViewFilterRepository.update(
      { id: workspaceViewFilter.id, workspaceId },
      updateData,
    );
  }

  public async deleteCoreViewFilter(
    workspaceId: string,
    workspaceViewFilter: ViewFilterWorkspaceEntity,
  ): Promise<void> {
    await this.coreViewFilterRepository.softDelete({
      id: workspaceViewFilter.id,
      workspaceId,
    });
  }

  public async restoreCoreViewFilter(
    workspaceId: string,
    workspaceViewFilter: ViewFilterWorkspaceEntity,
  ): Promise<void> {
    await this.coreViewFilterRepository.restore({
      id: workspaceViewFilter.id,
      workspaceId,
    });
  }
}
