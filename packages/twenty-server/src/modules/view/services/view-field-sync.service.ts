import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ViewField } from 'src/engine/metadata-modules/view/view-field.entity';
import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';

@Injectable()
export class ViewFieldSyncService {
  constructor(
    @InjectRepository(ViewField, 'core')
    private readonly coreViewFieldRepository: Repository<ViewField>,
  ) {}

  public async createCoreViewField(
    workspaceId: string,
    workspaceViewField: ViewFieldWorkspaceEntity,
  ): Promise<void> {
    const coreViewField = {
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
    workspaceViewField: ViewFieldWorkspaceEntity,
  ): Promise<void> {
    const updateData = {
      fieldMetadataId: workspaceViewField.fieldMetadataId,
      viewId: workspaceViewField.viewId,
      position: workspaceViewField.position,
      isVisible: workspaceViewField.isVisible,
      size: workspaceViewField.size,
      updatedAt: new Date(workspaceViewField.updatedAt),
      deletedAt: workspaceViewField.deletedAt
        ? new Date(workspaceViewField.deletedAt)
        : null,
    };

    await this.coreViewFieldRepository.update(
      { id: workspaceViewField.id, workspaceId },
      updateData,
    );
  }

  public async deleteCoreViewField(
    workspaceId: string,
    workspaceViewField: ViewFieldWorkspaceEntity,
  ): Promise<void> {
    await this.coreViewFieldRepository.softDelete({
      id: workspaceViewField.id,
      workspaceId,
    });
  }

  public async restoreCoreViewField(
    workspaceId: string,
    workspaceViewField: ViewFieldWorkspaceEntity,
  ): Promise<void> {
    await this.coreViewFieldRepository.restore({
      id: workspaceViewField.id,
      workspaceId,
    });
  }
}
