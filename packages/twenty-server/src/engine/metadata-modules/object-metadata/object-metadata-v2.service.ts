import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { EMPTY_FLAT_ENTITY_MAPS } from 'src/engine/core-modules/common/constant/empty-flat-entity-maps.constant';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { getSubFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/get-sub-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { ViewKey } from 'src/engine/core-modules/view/enums/view-key.enum';
import { ViewType } from 'src/engine/core-modules/view/enums/view-type.enum';
import { FlatView } from 'src/engine/core-modules/view/flat-view/types/flat-view.type';
import { fromCreateViewFieldInputToFlatViewFieldToCreate } from 'src/engine/core-modules/view/flat-view/utils/from-create-view-field-input-to-flat-view-field-to-create.util';
import { fromCreateViewInputToFlatViewToCreate } from 'src/engine/core-modules/view/flat-view/utils/from-create-view-input-to-flat-view-to-create.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findObjectFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-object-fields-in-flat-field-metadata-maps-or-throw.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromCreateObjectInputToFlatObjectMetadataAndFlatFieldMetadatasToCreate } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-create-object-input-to-flat-object-metadata-and-flat-field-metadatas-to-create.util';
import { fromDeleteObjectInputToFlatFieldMetadatasToDelete } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-delete-object-input-to-flat-field-metadatas-to-delete.util';
import { fromFlatObjectMetadataToObjectMetadataDto } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-to-object-metadata-dto.util';
import { fromUpdateObjectInputToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-update-object-input-to-flat-object-metadata.util';
import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { DeleteOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/delete-object.input';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { UpdateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
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
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatEntities: [
          'flatObjectMetadataMaps',
          'flatIndexMaps',
          'flatFieldMetadataMaps',
        ],
      },
    );

    const {
      flatObjectMetadata: optimisticallyUpdatedFlatObjectMetadata,
      otherObjectFlatFieldMetadataToUpdate: otherObjectFlatFieldMetadatas,
      flatIndexMetadataToUpdate,
    } = fromUpdateObjectInputToFlatObjectMetadata({
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      updateObjectInput,
      flatIndexMaps: existingFlatIndexMaps,
    });

    const toFlatObjectMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: optimisticallyUpdatedFlatObjectMetadata,
      flatEntityMaps: EMPTY_FLAT_ENTITY_MAPS,
    });

    const toFlatFieldMetadataMaps = otherObjectFlatFieldMetadatas.reduce(
      (flatFieldMaps, flatFieldMetadata) =>
        replaceFlatEntityInFlatEntityMapsOrThrow({
          flatEntity: flatFieldMetadata,
          flatEntityMaps: flatFieldMaps,
        }),
      getSubFlatEntityMapsOrThrow({
        flatEntityIds: otherObjectFlatFieldMetadatas.map(({ id }) => id),
        flatEntityMaps: existingFlatFieldMetadataMaps,
      }),
    );

    const toFlatIndexMaps = flatIndexMetadataToUpdate.reduce(
      (flatIndexMaps, flatIndexMetadata) =>
        replaceFlatEntityInFlatEntityMapsOrThrow({
          flatEntity: flatIndexMetadata,
          flatEntityMaps: flatIndexMaps,
        }),
      getSubFlatEntityMapsOrThrow({
        flatEntityIds: flatIndexMetadataToUpdate.map(({ id }) => id),
        flatEntityMaps: existingFlatIndexMaps,
      }),
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatObjectMetadataMaps: {
              from: existingFlatObjectMetadataMaps,
              to: toFlatObjectMetadataMaps,
            },
            flatIndexMaps: {
              from: existingFlatIndexMaps,
              to: toFlatIndexMaps,
            },
            flatFieldMetadataMaps: {
              from: existingFlatFieldMetadataMaps,
              to: toFlatFieldMetadataMaps,
            },
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: false,
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
          flatEntities: ['flatObjectMetadataMaps'],
        },
      );

    const updatedFlatObjectMetadata =
      recomputedFlatObjectMetadataMaps.byId[
        optimisticallyUpdatedFlatObjectMetadata.id
      ];

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
        flatEntities: [
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

    const impactedObjectMetadataIds = Array.from(
      new Set(
        flatFieldMetadatasToDelete.map(
          (flatFieldMetadata) => flatFieldMetadata.objectMetadataId,
        ),
      ),
    );

    const fromFlatObjectMetadataMaps = getSubFlatEntityMapsOrThrow({
      flatEntityMaps: existingFlatObjectMetadataMaps,
      flatEntityIds: impactedObjectMetadataIds,
    });

    const toFlatObjectMetadataMaps = deleteFlatEntityFromFlatEntityMapsOrThrow({
      entityToDeleteId: flatObjectMetadataToDelete.id,
      flatEntityMaps: fromFlatObjectMetadataMaps,
    });

    const fromFlatFieldMetadataMaps = getSubFlatEntityMapsOrThrow({
      flatEntityMaps: existingFlatFieldMetadataMaps,
      flatEntityIds: flatFieldMetadatasToDelete.map(
        (flatField) => flatField.id,
      ),
    });

    const toFlatFieldMetadataMaps = flatFieldMetadatasToDelete.reduce(
      (flatFieldMaps, flatField) =>
        deleteFlatEntityFromFlatEntityMapsOrThrow({
          entityToDeleteId: flatField.id,
          flatEntityMaps: flatFieldMaps,
        }),
      fromFlatFieldMetadataMaps,
    );

    const fromFlatIndexMaps = getSubFlatEntityMapsOrThrow({
      flatEntityIds: flatIndexToDelete.map((flatIndex) => flatIndex.id),
      flatEntityMaps: existingFlatIndexMaps,
    });

    const toFlatIndexMaps = flatIndexToDelete.reduce(
      (flatIndexMaps, flatIndex) =>
        deleteFlatEntityFromFlatEntityMapsOrThrow({
          entityToDeleteId: flatIndex.id,
          flatEntityMaps: flatIndexMaps,
        }),
      fromFlatIndexMaps,
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatObjectMetadataMaps: {
              from: fromFlatObjectMetadataMaps,
              to: toFlatObjectMetadataMaps,
            },
            flatIndexMaps: {
              from: fromFlatIndexMaps,
              to: toFlatIndexMaps,
            },
            flatFieldMetadataMaps: {
              from: fromFlatFieldMetadataMaps,
              to: toFlatFieldMetadataMaps,
            },
          },
          buildOptions: {
            inferDeletionFromMissingEntities: true,
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
        flatEntities: [
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

    const toFlatFieldMetadataMaps = [
      ...flatFieldMetadataToCreateOnObject,
      ...relationTargetFlatFieldMetadataToCreate,
    ].reduce(
      (flatFieldMaps, flatField) =>
        addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: flatField,
          flatEntityMaps: flatFieldMaps,
        }),
      EMPTY_FLAT_ENTITY_MAPS,
    );

    const toFlatObjectMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: flatObjectMetadataToCreate,
      flatEntityMaps: EMPTY_FLAT_ENTITY_MAPS,
    });

    const flatDefaultViewToCreate = await this.createDefaultFlatView({
      objectMetadata: flatObjectMetadataToCreate,
      workspaceId,
    });

    const toFlatViewMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: flatDefaultViewToCreate,
      flatEntityMaps: existingFlatViewMaps,
    });

    const { objectFlatFieldMetadatas } = findObjectFlatFieldMetadatasOrThrow({
      flatFieldMetadataMaps: toFlatFieldMetadataMaps,
      flatObjectMetadata: flatObjectMetadataToCreate,
    });
    const flatDefaultViewFieldsToCreate =
      await this.createDefaultFlatViewFields({
        objectFlatFieldMetadatas,
        viewId: flatDefaultViewToCreate.id,
        workspaceId,
      });

    const toFlatViewFieldMaps = flatDefaultViewFieldsToCreate.reduce(
      (acc, flatViewField) =>
        addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: flatViewField,
          flatEntityMaps: acc,
        }),
      existingFlatViewFieldMaps,
    );

    const toFlatIndexMaps = flatIndexMetadataToCreate.reduce(
      (flatIndexMaps, flatIndexMetadata) =>
        addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: flatIndexMetadata,
          flatEntityMaps: flatIndexMaps,
        }),
      existingFlatIndexMaps,
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatObjectMetadataMaps: {
              from: existingFlatObjectMetadataMaps,
              to: toFlatObjectMetadataMaps,
            },
            flatViewMaps: {
              from: existingFlatViewMaps,
              to: toFlatViewMaps,
            },
            flatViewFieldMaps: {
              from: existingFlatViewFieldMaps,
              to: toFlatViewFieldMaps,
            },
            flatFieldMetadataMaps: {
              from: existingFlatFieldMetadataMaps,
              to: toFlatFieldMetadataMaps,
            },
            flatIndexMaps: {
              from: existingFlatIndexMaps,
              to: toFlatIndexMaps,
            },
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: false,
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
          flatEntities: ['flatObjectMetadataMaps'],
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
