import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ObjectRecordDiff } from 'src/engine/core-modules/event-emitter/types/object-record-diff';
import { ViewGroup } from 'src/engine/metadata-modules/view/view-group.entity';
import { ViewGroupWorkspaceEntity } from 'src/modules/view/standard-objects/view-group.workspace-entity';

@Injectable()
export class ViewGroupSyncService {
  constructor(
    @InjectRepository(ViewGroup, 'core')
    private readonly coreViewGroupRepository: Repository<ViewGroup>,
  ) {}

  private parseUpdateDataFromDiff(
    diff: Partial<ObjectRecordDiff<ViewGroupWorkspaceEntity>>,
  ): Partial<ViewGroup> {
    const updateData: Record<string, unknown> = {};

    for (const key of Object.keys(diff)) {
      const diffValue = diff[key as keyof ViewGroupWorkspaceEntity];

      if (isDefined(diffValue)) {
        updateData[key] = diffValue.after;
      }
    }

    return updateData as Partial<ViewGroup>;
  }

  public async createCoreViewGroup(
    workspaceId: string,
    workspaceViewGroup: ViewGroupWorkspaceEntity,
  ): Promise<void> {
    if (!workspaceViewGroup.viewId) {
      return;
    }

    const coreViewGroup: Partial<ViewGroup> = {
      id: workspaceViewGroup.id,
      fieldMetadataId: workspaceViewGroup.fieldMetadataId,
      viewId: workspaceViewGroup.viewId,
      fieldValue: workspaceViewGroup.fieldValue,
      isVisible: workspaceViewGroup.isVisible,
      position: workspaceViewGroup.position,
      workspaceId,
      createdAt: new Date(workspaceViewGroup.createdAt),
      updatedAt: new Date(workspaceViewGroup.updatedAt),
      deletedAt: workspaceViewGroup.deletedAt
        ? new Date(workspaceViewGroup.deletedAt)
        : null,
    };

    await this.coreViewGroupRepository.save(coreViewGroup);
  }

  public async updateCoreViewGroup(
    workspaceId: string,
    workspaceViewGroup: ViewGroupWorkspaceEntity,
    diff?: Partial<ObjectRecordDiff<ViewGroupWorkspaceEntity>>,
  ): Promise<void> {
    if (!workspaceViewGroup.viewId) {
      return;
    }

    if (!diff || Object.keys(diff).length === 0) {
      return;
    }

    const updateData = this.parseUpdateDataFromDiff(diff);

    if (Object.keys(updateData).length > 0) {
      await this.coreViewGroupRepository.update(
        { id: workspaceViewGroup.id, workspaceId },
        updateData,
      );
    }
  }

  public async deleteCoreViewGroup(
    workspaceId: string,
    workspaceViewGroup: Pick<ViewGroupWorkspaceEntity, 'id'>,
  ): Promise<void> {
    await this.coreViewGroupRepository.softDelete({
      id: workspaceViewGroup.id,
      workspaceId,
    });
  }

  public async destroyCoreViewGroup(
    workspaceId: string,
    workspaceViewGroup: Pick<ViewGroupWorkspaceEntity, 'id'>,
  ): Promise<void> {
    await this.coreViewGroupRepository.delete({
      id: workspaceViewGroup.id,
      workspaceId,
    });
  }

  public async restoreCoreViewGroup(
    workspaceId: string,
    workspaceViewGroup: Pick<ViewGroupWorkspaceEntity, 'id'>,
  ): Promise<void> {
    await this.coreViewGroupRepository.restore({
      id: workspaceViewGroup.id,
      workspaceId,
    });
  }
}
