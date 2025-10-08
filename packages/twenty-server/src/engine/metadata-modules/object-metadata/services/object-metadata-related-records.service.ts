import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ViewDTO } from 'src/engine/core-modules/view/dtos/view.dto';
import { ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { ViewKey } from 'src/engine/core-modules/view/enums/view-key.enum';
import { ViewType } from 'src/engine/core-modules/view/enums/view-type.enum';
import { ViewFieldService } from 'src/engine/core-modules/view/services/view-field.service';
import { ViewService } from 'src/engine/core-modules/view/services/view.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/constants/DEFAULT_VIEW_FIELD_SIZE';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';

@Injectable()
export class ObjectMetadataRelatedRecordsService {
  constructor(
    private readonly viewService: ViewService,
    private readonly viewFieldService: ViewFieldService,
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  public async createObjectRelatedRecords(
    objectMetadata: ObjectMetadataEntity,
  ) {
    const view = await this.createView(objectMetadata);

    await this.createViewFields(objectMetadata, view.id);
    await this.createViewWorkspaceFavorite(objectMetadata.workspaceId, view.id);
    await this.viewService.flushGraphQLCache(objectMetadata.workspaceId);
  }

  public async updateLabelMetadataIdentifierInObjectViews({
    newLabelMetadataIdentifierFieldMetadata,
  }: {
    newLabelMetadataIdentifierFieldMetadata: FieldMetadataEntity;
  }) {
    const objectMetadataViews = await this.viewService.findByObjectMetadataId(
      newLabelMetadataIdentifierFieldMetadata.workspaceId,
      newLabelMetadataIdentifierFieldMetadata.objectMetadataId,
    );

    for (const view of objectMetadataViews) {
      let labelMetadataIdentifierViewField = view.viewFields.find(
        (viewField) =>
          viewField.fieldMetadataId ===
          newLabelMetadataIdentifierFieldMetadata.id,
      );

      const currentMinPositionAmongViewFields = this.getViewFieldsMinPosition(
        view.viewFields,
      );

      if (!labelMetadataIdentifierViewField) {
        await this.viewFieldService.create({
          fieldMetadataId: newLabelMetadataIdentifierFieldMetadata.id,
          position: currentMinPositionAmongViewFields - 1,
          isVisible: true,
          size: DEFAULT_VIEW_FIELD_SIZE,
          viewId: view.id,
          workspaceId: newLabelMetadataIdentifierFieldMetadata.workspaceId,
        });
        continue;
      }

      await this.viewFieldService.update(
        labelMetadataIdentifierViewField.id,
        newLabelMetadataIdentifierFieldMetadata.workspaceId,
        {
          position: currentMinPositionAmongViewFields - 1,
          isVisible: true,
        },
      );
    }
  }

  private getViewFieldsMinPosition(viewFields: ViewFieldEntity[]): number {
    if (viewFields.length === 0) {
      return 0;
    }

    return viewFields.reduce((min, field) => Math.min(min, field.position), 0);
  }

  private async createView(
    objectMetadata: ObjectMetadataEntity,
  ): Promise<ViewDTO> {
    return await this.viewService.create({
      objectMetadataId: objectMetadata.id,
      type: ViewType.TABLE,
      name: `All ${objectMetadata.labelPlural}`,
      key: ViewKey.INDEX,
      icon: 'IconList',
      workspaceId: objectMetadata.workspaceId,
    });
  }

  private async createViewFields(
    objectMetadata: ObjectMetadataEntity,
    viewId: string,
  ): Promise<void> {
    const viewFields = objectMetadata.fields
      .filter((field) => field.name !== 'id' && field.name !== 'deletedAt')
      .map((field, index) => ({
        fieldMetadataId: field.id,
        position: index,
        isVisible: true,
        size: DEFAULT_VIEW_FIELD_SIZE,
        viewId: viewId,
        workspaceId: objectMetadata.workspaceId,
      }));

    for (const viewField of viewFields) {
      await this.viewFieldService.create(viewField);
    }
  }

  public async createViewWorkspaceFavorite(
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
    updatedObjectMetadata: Pick<
      ObjectMetadataEntity,
      'id' | 'labelPlural' | 'icon'
    >,
    workspaceId: string,
  ) {
    await this.viewRepository.update(
      {
        objectMetadataId: updatedObjectMetadata.id,
        key: ViewKey.INDEX,
        workspaceId,
      },
      {
        name: `All ${updatedObjectMetadata.labelPlural}`,
        ...(isDefined(updatedObjectMetadata.icon)
          ? { icon: updatedObjectMetadata.icon }
          : {}),
      },
    );
  }

  public async deleteObjectViews(
    objectMetadata: ObjectMetadataEntity,
    workspaceId: string,
  ) {
    await this.viewRepository.delete({
      objectMetadataId: objectMetadata.id,
      workspaceId,
    });
  }
}
