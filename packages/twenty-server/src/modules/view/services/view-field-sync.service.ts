import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ObjectRecordDiff } from 'src/engine/core-modules/event-emitter/types/object-record-diff';
import { ViewField } from 'src/engine/metadata-modules/view/view-field.entity';
import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';

@Injectable()
export class ViewFieldSyncService {
  constructor(
    @InjectRepository(ViewField, 'core')
    private readonly coreViewFieldRepository: Repository<ViewField>,
  ) {}

  private parseUpdateDataFromDiff(
    diff: Partial<ObjectRecordDiff<ViewFieldWorkspaceEntity>>,
  ): Partial<ViewField> {
    const updateData: Record<string, unknown> = {};

    for (const key of Object.keys(diff)) {
      const diffValue = diff[key as keyof ViewFieldWorkspaceEntity];

      if (isDefined(diffValue)) {
        updateData[key] = diffValue.after;
      }
    }

    return updateData as Partial<ViewField>;
  }

  public async createCoreViewField(
    workspaceId: string,
    workspaceViewField: ViewFieldWorkspaceEntity,
  ): Promise<void> {
    const coreViewField: Partial<ViewField> = {
      id: workspaceViewField.id,
      fieldMetadataId: workspaceViewField.fieldMetadataId,
      viewId: workspaceViewField.viewId,
      position: workspaceViewField.position,
      isVisible: workspaceViewField.isVisible,
      size: workspaceViewField.size,
      workspaceId,
      createdAt: new Date(workspaceViewField.createdAt),
      updatedAt: new Date(workspaceViewField.updatedAt),
      deletedAt: workspaceViewField.deletedAt
        ? new Date(workspaceViewField.deletedAt)
        : null,
    };

    await this.coreViewFieldRepository.save(coreViewField);
  }

  public async updateCoreViewField(
    workspaceId: string,
    workspaceViewField: Pick<ViewFieldWorkspaceEntity, 'id'>,
    diff?: Partial<ObjectRecordDiff<ViewFieldWorkspaceEntity>>,
  ): Promise<void> {
    if (!diff || Object.keys(diff).length === 0) {
      return;
    }

    const updateData = this.parseUpdateDataFromDiff(diff);

    if (Object.keys(updateData).length > 0) {
      await this.coreViewFieldRepository.update(
        { id: workspaceViewField.id, workspaceId },
        updateData,
      );
    }
  }

  public async deleteCoreViewField(
    workspaceId: string,
    workspaceViewField: Pick<ViewFieldWorkspaceEntity, 'id'>,
  ): Promise<void> {
    await this.coreViewFieldRepository.softDelete({
      id: workspaceViewField.id,
      workspaceId,
    });
  }

  public async destroyCoreViewField(
    workspaceId: string,
    workspaceViewField: Pick<ViewFieldWorkspaceEntity, 'id'>,
  ): Promise<void> {
    await this.coreViewFieldRepository.delete({
      id: workspaceViewField.id,
      workspaceId,
    });
  }

  public async restoreCoreViewField(
    workspaceId: string,
    workspaceViewField: Pick<ViewFieldWorkspaceEntity, 'id'>,
  ): Promise<void> {
    await this.coreViewFieldRepository.restore({
      id: workspaceViewField.id,
      workspaceId,
    });
  }
}
