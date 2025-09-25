import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.service.';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { ViewKey } from 'src/engine/core-modules/view/enums/view-key.enum';
import { ViewType } from 'src/engine/core-modules/view/enums/view-type.enum';
import { FlatView } from 'src/engine/core-modules/view/flat-view/types/flat-view.type';
import { fromCreateViewFieldInputToFlatViewFieldToCreate } from 'src/engine/core-modules/view/flat-view/utils/from-create-view-field-input-to-flat-view-field-to-create.util';
import { fromCreateViewInputToFlatViewToCreate } from 'src/engine/core-modules/view/flat-view/utils/from-create-view-input-to-flat-view-to-create.util';
import { addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-to-flat-object-metadata-maps-or-throw.util';
import { deleteFieldFromFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-field-from-flat-object-metadata-maps-or-throw.util';
import { deleteObjectFromFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-object-from-flat-object-metadata-maps-or-throw.util';
import { getSubFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/get-sub-flat-object-metadata-maps-or-throw.util';
import { getSubFlatObjectMetadataMapsOutOfFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/get-sub-flat-object-metadata-maps-out-of-flat-field-metadatas-or-throw.util';
import { replaceFlatFieldMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/replace-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/replace-flat-object-metadata-in-flat-object-metadata-maps-or-throw.util';
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
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: ['flatObjectMetadataMaps', 'flatIndexMaps'],
        },
      );

    const {
      flatObjectMetadata: optimisticallyUpdatedFlatObjectMetadata,
      otherObjectFlatFieldMetadataToUpdate: otherObjectFlatFieldMetadatas,
      flatIndexMetadataToUpdate,
    } = fromUpdateObjectInputToFlatObjectMetadata({
      existingFlatObjectMetadataMaps,
      updateObjectInput,
      flatIndexMaps: existingFlatIndexMaps,
    });

    const impactedObjectMetadataIds = [
      ...new Set([
        optimisticallyUpdatedFlatObjectMetadata.id,
        ...otherObjectFlatFieldMetadatas.map(
          (flatFieldMetadata) => flatFieldMetadata.objectMetadataId,
        ),
      ]),
    ];
    const fromFlatObjectMetadataMaps = getSubFlatObjectMetadataMapsOrThrow({
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      objectMetadataIds: impactedObjectMetadataIds,
    });
    const toFlatObjectMetadataMaps = otherObjectFlatFieldMetadatas.reduce(
      (flatObjectMetadataMaps, flatFieldMetadata) =>
        replaceFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
          flatFieldMetadata,
          flatObjectMetadataMaps,
        }),
      replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow({
        flatObjectMetadata: optimisticallyUpdatedFlatObjectMetadata,
        flatObjectMetadataMaps: fromFlatObjectMetadataMaps,
      }),
    );

    const toFlatIndexMaps = flatIndexMetadataToUpdate.reduce(
      (flatIndexMaps, flatIndexMetadata) =>
        replaceFlatEntityInFlatEntityMapsOrThrow({
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
              from: fromFlatObjectMetadataMaps,
              to: toFlatObjectMetadataMaps,
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
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: ['flatObjectMetadataMaps', 'flatIndexMaps'],
        },
      );

    const {
      flatFieldMetadatasToDelete,
      flatObjectMetadataToDelete,
      flatIndexToDelete,
    } = fromDeleteObjectInputToFlatFieldMetadatasToDelete({
      existingFlatIndexMaps,
      deleteObjectInput,
      existingFlatObjectMetadataMaps,
    });
    const { id: objectMetadataToDeleteId } = flatObjectMetadataToDelete;

    const impactedObjectMetadataIds = Array.from(
      new Set(
        flatFieldMetadatasToDelete.map(
          (flatFieldMetadata) => flatFieldMetadata.objectMetadataId,
        ),
      ),
    );

    const fromFlatObjectMetadataMaps = getSubFlatObjectMetadataMapsOrThrow({
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      objectMetadataIds: impactedObjectMetadataIds,
    });

    const toFlatObjectMetadataMaps = flatFieldMetadatasToDelete
      .filter(
        (flatFieldMetadataToDelete) =>
          flatFieldMetadataToDelete.objectMetadataId !==
          objectMetadataToDeleteId,
      )
      .reduce(
        (flatObjectMetadataMaps, flatFieldMetadata) =>
          deleteFieldFromFlatObjectMetadataMapsOrThrow({
            fieldMetadataId: flatFieldMetadata.id,
            objectMetadataId: flatFieldMetadata.objectMetadataId,
            flatObjectMetadataMaps,
          }),
        deleteObjectFromFlatObjectMetadataMapsOrThrow({
          flatObjectMetadataMaps: fromFlatObjectMetadataMaps,
          objectMetadataId: objectMetadataToDeleteId,
        }),
      );

    const toFlatIndexMaps = flatIndexToDelete.reduce(
      (flatIndexMaps, flatIndex) =>
        deleteFlatEntityFromFlatEntityMapsOrThrow({
          entityToDeleteId: flatIndex.id,
          flatEntityMaps: flatIndexMaps,
        }),
      existingFlatIndexMaps,
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
              from: existingFlatIndexMaps,
              to: toFlatIndexMaps,
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
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatEntities: [
          'flatObjectMetadataMaps',
          'flatViewMaps',
          'flatViewFieldMaps',
          'flatIndexMaps',
        ],
      },
    );

    const {
      flatObjectMetadataToCreate,
      relationTargetFlatFieldMetadataToCreate,
      flatIndexMetadataToCreate,
    } = fromCreateObjectInputToFlatObjectMetadataAndFlatFieldMetadatasToCreate({
      createObjectInput,
      workspaceId,
      existingFlatObjectMetadataMaps,
    });

    const existingFlatObjectMetadataMapsWithTargetRelationFlatFieldMetadatas =
      relationTargetFlatFieldMetadataToCreate.reduce(
        (flatObjectMetadataMaps, flatFieldMetadata) =>
          addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
            flatFieldMetadata,
            flatObjectMetadataMaps,
          }),
        existingFlatObjectMetadataMaps,
      );

    const flatObjectMetadataMapsWithTargetRelationFlatFieldMetadatas =
      getSubFlatObjectMetadataMapsOutOfFlatFieldMetadatasOrThrow({
        flatFieldMetadatas: relationTargetFlatFieldMetadataToCreate,
        flatObjectMetadataMaps:
          existingFlatObjectMetadataMapsWithTargetRelationFlatFieldMetadatas,
      });

    const toFlatObjectMetadataMaps =
      addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow({
        flatObjectMetadata: flatObjectMetadataToCreate,
        flatObjectMetadataMaps:
          flatObjectMetadataMapsWithTargetRelationFlatFieldMetadatas,
      });

    const impactedObjectMetadataIds = [
      ...new Set(
        relationTargetFlatFieldMetadataToCreate.map(
          ({ objectMetadataId }) => objectMetadataId,
        ),
      ),
    ];
    const fromFlatObjectMetadataMaps = getSubFlatObjectMetadataMapsOrThrow({
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      objectMetadataIds: [
        ...(isDefined(
          existingFlatObjectMetadataMaps.byId[flatObjectMetadataToCreate.id],
        )
          ? [flatObjectMetadataToCreate.id]
          : []),
        ...impactedObjectMetadataIds,
      ],
    });

    const flatDefaultViewToCreate = await this.createDefaultFlatView(
      flatObjectMetadataToCreate,
      workspaceId,
    );

    const toFlatViewMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: flatDefaultViewToCreate,
      flatEntityMaps: existingFlatViewMaps,
    });

    const flatDefaultViewFieldsToCreate =
      await this.createDefaultFlatViewFields(
        flatObjectMetadataToCreate,
        flatDefaultViewToCreate.id,
        workspaceId,
      );

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
              from: fromFlatObjectMetadataMaps,
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

    await this.createWorkspaceFavoriteForNewObjectDefaultView(
      flatDefaultViewToCreate,
      workspaceId,
    );

    return createdFlatObjectMetadata;
  }

  private async createDefaultFlatView(
    objectMetadata: FlatObjectMetadata,
    workspaceId: string,
  ) {
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

  private async createDefaultFlatViewFields(
    objectMetadata: FlatObjectMetadata,
    viewId: string,
    workspaceId: string,
  ) {
    const defaultViewFields = objectMetadata.flatFieldMetadatas
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

  private async createWorkspaceFavoriteForNewObjectDefaultView(
    view: FlatView,
    workspaceId: string,
  ) {
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
