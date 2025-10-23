import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { computeFlatEntityMapsFromTo } from 'src/engine/metadata-modules/flat-entity/utils/compute-flat-entity-maps-from-to.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromCreateObjectInputToFlatObjectMetadataAndFlatFieldMetadatasToCreate } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-create-object-input-to-flat-object-metadata-and-flat-field-metadatas-to-create.util';
import { fromDeleteObjectInputToFlatFieldMetadatasToDelete } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-delete-object-input-to-flat-field-metadatas-to-delete.util';
import { fromFlatObjectMetadataToObjectMetadataDto } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-to-object-metadata-dto.util';
import { fromUpdateObjectInputToFlatObjectMetadataAndRelatedFlatEntities } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-update-object-input-to-flat-object-metadata-and-related-flat-entities.util';
import { fromCreateViewFieldInputToFlatViewFieldToCreate } from 'src/engine/metadata-modules/flat-view-field/utils/from-create-view-field-input-to-flat-view-field-to-create.util';
import { FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { fromCreateViewInputToFlatViewToCreate } from 'src/engine/metadata-modules/flat-view/utils/from-create-view-input-to-flat-view-to-create.util';
import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { DeleteOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/delete-object.input';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { UpdateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { ViewKey } from 'src/engine/metadata-modules/view/enums/view-key.enum';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/constants/DEFAULT_VIEW_FIELD_SIZE';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';

@Injectable()
export class ObjectMetadataServiceV2 {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async updateOne({
    updateObjectInput,
    workspaceId,
  }: {
    workspaceId: string;
    updateObjectInput: UpdateOneObjectInput;
  }): Promise<ObjectMetadataDTO> {
    const {
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      flatIndexMaps: existingFlatIndexMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
      flatViewFieldMaps: existingFlatViewFieldMaps,
      flatViewMaps: existingFlatViewMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatObjectMetadataMaps',
          'flatIndexMaps',
          'flatFieldMetadataMaps',
          'flatViewFieldMaps',
          'flatViewMaps',
        ],
      },
    );

    const {
      otherObjectFlatFieldMetadatasToUpdate,
      flatObjectMetadataToUpdate,
      flatIndexMetadatasToUpdate,
      flatViewFieldsToCreate,
      flatViewFieldsToUpdate,
    } = fromUpdateObjectInputToFlatObjectMetadataAndRelatedFlatEntities({
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      updateObjectInput,
      flatIndexMaps: existingFlatIndexMaps,
      flatViewFieldMaps: existingFlatViewFieldMaps,
      flatViewMaps: existingFlatViewMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatObjectMetadataMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatObjectMetadataMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatObjectMetadataToUpdate],
            }),
            flatIndexMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatIndexMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: flatIndexMetadatasToUpdate,
            }),
            flatFieldMetadataMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatFieldMetadataMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: otherObjectFlatFieldMetadatasToUpdate,
            }),
            flatViewFieldMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewFieldMaps,
              flatEntityToCreate: flatViewFieldsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: flatViewFieldsToUpdate,
            }),
          },
          dependencyAllFlatEntityMaps: {
            flatViewMaps: existingFlatViewMaps,
          },
          buildOptions: {
            isSystemBuild: false,
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating object',
      );
    }

    const { flatObjectMetadataMaps: recomputedFlatObjectMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const updatedFlatObjectMetadata =
      recomputedFlatObjectMetadataMaps.byId[flatObjectMetadataToUpdate.id];

    if (!isDefined(updatedFlatObjectMetadata)) {
      throw new ObjectMetadataException(
        'Updated object metadata not found in recomputed cache',
        ObjectMetadataExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    if (isDefined(updateObjectInput.update.labelIdentifierFieldMetadataId)) {
      await this.workspacePermissionsCacheService.recomputeRolesPermissionsCache(
        {
          workspaceId,
        },
      );
    }

    return fromFlatObjectMetadataToObjectMetadataDto(updatedFlatObjectMetadata);
  }

  async deleteOne({
    deleteObjectInput,
    workspaceId,
    isSystemBuild = false,
  }: {
    deleteObjectInput: DeleteOneObjectInput;
    workspaceId: string;
    isSystemBuild?: boolean;
  }): Promise<ObjectMetadataDTO> {
    const {
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      flatIndexMaps: existingFlatIndexMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatObjectMetadataMaps',
          'flatIndexMaps',
          'flatFieldMetadataMaps',
        ],
      },
    );

    const {
      flatFieldMetadatasToDelete,
      flatObjectMetadataToDelete,
      flatIndexToDelete,
    } = fromDeleteObjectInputToFlatFieldMetadatasToDelete({
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      flatIndexMaps: existingFlatIndexMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
      deleteObjectInput,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatObjectMetadataMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatObjectMetadataMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [flatObjectMetadataToDelete],
              flatEntityToUpdate: [],
            }),
            flatIndexMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatIndexMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: flatIndexToDelete,
              flatEntityToUpdate: [],
            }),
            flatFieldMetadataMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatFieldMetadataMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: flatFieldMetadatasToDelete,
              flatEntityToUpdate: [],
            }),
          },
          buildOptions: {
            inferDeletionFromMissingEntities: {
              objectMetadata: true,
              fieldMetadata: true,
              index: true,
            },
            isSystemBuild,
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting object',
      );
    }

    return fromFlatObjectMetadataToObjectMetadataDto(
      flatObjectMetadataToDelete,
    );
  }

  async createOne({
    createObjectInput,
    workspaceId,
  }: {
    createObjectInput: Omit<CreateObjectInput, 'workspaceId'>;
    workspaceId: string;
  }): Promise<FlatObjectMetadata> {
    const {
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      flatViewMaps: existingFlatViewMaps,
      flatViewFieldMaps: existingFlatViewFieldMaps,
      flatIndexMaps: existingFlatIndexMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatObjectMetadataMaps',
          'flatViewMaps',
          'flatViewFieldMaps',
          'flatIndexMaps',
          'flatFieldMetadataMaps',
        ],
      },
    );

    const {
      flatObjectMetadataToCreate,
      flatIndexMetadataToCreate,
      flatFieldMetadataToCreateOnObject,
      relationTargetFlatFieldMetadataToCreate,
    } = fromCreateObjectInputToFlatObjectMetadataAndFlatFieldMetadatasToCreate({
      createObjectInput,
      workspaceId,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
    });

    const flatFieldMetadataMapsFromTo = computeFlatEntityMapsFromTo({
      flatEntityMaps: existingFlatFieldMetadataMaps,
      flatEntityToCreate: [
        ...flatFieldMetadataToCreateOnObject,
        ...relationTargetFlatFieldMetadataToCreate,
      ],
      flatEntityToDelete: [],
      flatEntityToUpdate: [],
    });

    const flatDefaultViewToCreate = await this.createDefaultFlatView({
      objectMetadata: flatObjectMetadataToCreate,
      workspaceId,
    });

    const flatDefaultViewFieldsToCreate =
      await this.createDefaultFlatViewFields({
        objectFlatFieldMetadatas: findManyFlatEntityByIdInFlatEntityMapsOrThrow(
          {
            flatEntityMaps: flatFieldMetadataMapsFromTo.to,
            flatEntityIds: flatFieldMetadataToCreateOnObject.map(
              ({ id }) => id,
            ),
          },
        ),
        viewId: flatDefaultViewToCreate.id,
        workspaceId,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatObjectMetadataMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatObjectMetadataMaps,
              flatEntityToCreate: [flatObjectMetadataToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            }),
            flatViewMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewMaps,
              flatEntityToCreate: [flatDefaultViewToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            }),
            flatViewFieldMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewFieldMaps,
              flatEntityToCreate: flatDefaultViewFieldsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            }),
            flatFieldMetadataMaps: flatFieldMetadataMapsFromTo,
            flatIndexMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatIndexMaps,
              flatEntityToCreate: flatIndexMetadataToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            }),
          },
          buildOptions: {
            isSystemBuild: false,
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating object',
      );
    }

    const { flatObjectMetadataMaps: recomputedFlatObjectMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const createdFlatObjectMetadata =
      recomputedFlatObjectMetadataMaps.byId[flatObjectMetadataToCreate.id];

    if (!isDefined(createdFlatObjectMetadata)) {
      throw new ObjectMetadataException(
        'Created object metadata not found in recomputed cache',
        ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    await this.createWorkspaceFavoriteForNewObjectDefaultView({
      view: flatDefaultViewToCreate,
      workspaceId,
    });

    return createdFlatObjectMetadata;
  }

  private async createDefaultFlatView({
    objectMetadata,
    workspaceId,
  }: {
    objectMetadata: FlatObjectMetadata;
    workspaceId: string;
  }) {
    const defaultViewInput = {
      objectMetadataId: objectMetadata.id,
      name: `All {objectLabelPlural}`,
      key: ViewKey.INDEX,
      icon: 'IconList',
      type: ViewType.TABLE,
      workspaceId: workspaceId,
    };

    const flatViewFromCreateInput = fromCreateViewInputToFlatViewToCreate({
      createViewInput: defaultViewInput,
      workspaceId,
    });

    return flatViewFromCreateInput;
  }

  private async createDefaultFlatViewFields({
    objectFlatFieldMetadatas,
    viewId,
    workspaceId,
  }: {
    objectFlatFieldMetadatas: FlatFieldMetadata[];
    viewId: string;
    workspaceId: string;
  }) {
    const defaultViewFields = objectFlatFieldMetadatas
      .filter((field) => field.name !== 'id' && field.name !== 'deletedAt')
      .map((field, index) =>
        fromCreateViewFieldInputToFlatViewFieldToCreate({
          createViewFieldInput: {
            fieldMetadataId: field.id,
            position: index,
            isVisible: true,
            size: DEFAULT_VIEW_FIELD_SIZE,
            viewId: viewId,
          },
          workspaceId: workspaceId,
        }),
      );

    return defaultViewFields;
  }

  private async createWorkspaceFavoriteForNewObjectDefaultView({
    view,
    workspaceId,
  }: {
    view: FlatView;
    workspaceId: string;
  }) {
    const favoriteRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<FavoriteWorkspaceEntity>(
        workspaceId,
        'favorite',
      );

    const favoriteCount = await favoriteRepository.count();

    await favoriteRepository.insert({
      viewId: view.id,
      position: favoriteCount,
    });
  }
}
