import { Injectable } from '@nestjs/common';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

@Injectable()
export class ObjectMetadataRelatedRecordsService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  public async createObjectRelatedRecords(
    objectMetadata: ObjectMetadataEntity,
  ) {
    const view = await this.createView(objectMetadata);

    await this.createViewFields(objectMetadata, view.id);
    await this.createViewWorkspaceFavorite(objectMetadata.workspaceId, view.id);
  }

  private async createView(
    objectMetadata: ObjectMetadataEntity,
  ): Promise<ViewWorkspaceEntity> {
    const viewRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewWorkspaceEntity>(
        objectMetadata.workspaceId,
        'view',
      );

    return await viewRepository.save({
      objectMetadataId: objectMetadata.id,
      type: 'table',
      name: `All ${objectMetadata.labelPlural}`,
      key: 'INDEX',
      icon: objectMetadata.icon,
    });
  }

  private async createViewFields(
    objectMetadata: ObjectMetadataEntity,
    viewId: string,
  ): Promise<void> {
    const viewFieldRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewFieldWorkspaceEntity>(
        objectMetadata.workspaceId,
        'viewField',
      );

    const viewFields = objectMetadata.fields
      .filter((field) => field.name !== 'id' && field.name !== 'deletedAt')
      .map((field, index) => ({
        fieldMetadataId: field.id,
        position: index,
        isVisible: true,
        size: 180,
        viewId: viewId,
      }));

    await viewFieldRepository.insert(viewFields);
  }

  private async createViewWorkspaceFavorite(
    workspaceId: string,
    viewId: string,
  ): Promise<void> {
    const favoriteRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<FavoriteWorkspaceEntity>(
        workspaceId,
        'favorite',
      );

    const favoriteCount = await favoriteRepository.count();

    await favoriteRepository.insert(
      favoriteRepository.create({
        viewId: viewId,
        position: favoriteCount,
      }),
    );
  }

  public async updateObjectViews(
    updatedObjectMetadata: ObjectMetadataEntity,
    workspaceId: string,
  ) {
    const viewRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewWorkspaceEntity>(
        workspaceId,
        'view',
      );

    await viewRepository.update(
      { objectMetadataId: updatedObjectMetadata.id, key: 'INDEX' },
      {
        name: `All ${updatedObjectMetadata.labelPlural}`,
        icon: updatedObjectMetadata.icon,
      },
    );
  }

  public async deleteObjectViews(
    objectMetadata: ObjectMetadataEntity,
    workspaceId: string,
  ) {
    const viewRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewWorkspaceEntity>(
        workspaceId,
        'view',
      );

    await viewRepository.delete({
      objectMetadataId: objectMetadata.id,
    });
  }
}
