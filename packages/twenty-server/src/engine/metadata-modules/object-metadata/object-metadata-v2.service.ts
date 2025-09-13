import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { ViewV2Service } from 'src/engine/core-modules/view/services/view-v2.service';
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
import { ObjectMetadataRelatedRecordsService } from 'src/engine/metadata-modules/object-metadata/services/object-metadata-related-records.service';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class ObjectMetadataServiceV2 {
  constructor(
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly objectMetadataRelatedRecordsService: ObjectMetadataRelatedRecordsService,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
    private readonly viewV2Service: ViewV2Service,
  ) {}

  async updateOne({
    updateObjectInput,
    workspaceId,
  }: {
    workspaceId: string;
    updateObjectInput: UpdateOneObjectInput;
  }): Promise<ObjectMetadataDTO> {
    const { flatObjectMetadataMaps: existingFlatObjectMetadataMaps } =
      await this.workspaceMetadataCacheService.getExistingOrRecomputeFlatObjectMetadataMaps(
        {
          workspaceId,
        },
      );

    const {
      flatObjectMetadata: optimisticallyUpdatedFlatObjectMetadata,
      otherObjectFlatFieldMetadatas,
    } = fromUpdateObjectInputToFlatObjectMetadata({
      existingFlatObjectMetadataMaps,
      updateObjectInput,
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
    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromFlatObjectMetadataMaps,
          toFlatObjectMetadataMaps,
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
      await this.workspaceMetadataCacheService.getExistingOrRecomputeFlatObjectMetadataMaps(
        {
          workspaceId,
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
  }: {
    deleteObjectInput: DeleteOneObjectInput;
    workspaceId: string;
  }): Promise<ObjectMetadataDTO> {
    const { flatObjectMetadataMaps: existingFlatObjectMetadataMaps } =
      await this.workspaceMetadataCacheService.getExistingOrRecomputeFlatObjectMetadataMaps(
        {
          workspaceId,
        },
      );

    const { flatFieldMetadatasToDelete, flatObjectMetadataToDelete } =
      fromDeleteObjectInputToFlatFieldMetadatasToDelete({
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

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromFlatObjectMetadataMaps,
          toFlatObjectMetadataMaps,
          buildOptions: {
            inferDeletionFromMissingEntities: true,
            isSystemBuild: false,
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
    const { flatObjectMetadataMaps: existingFlatObjectMetadataMaps } =
      await this.workspaceMetadataCacheService.getExistingOrRecomputeFlatObjectMetadataMaps(
        {
          workspaceId,
        },
      );

    const { flatObjectMetadataToCreate, relationTargetFlatFieldMetadatas } =
      fromCreateObjectInputToFlatObjectMetadataAndFlatFieldMetadatasToCreate({
        createObjectInput,
        workspaceId,
        existingFlatObjectMetadataMaps,
      });

    const existingFlatObjectMetadataMapsWithTargetRelationFlatFieldMetadatas =
      relationTargetFlatFieldMetadatas.reduce(
        (flatObjectMetadataMaps, flatFieldMetadata) =>
          addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
            flatFieldMetadata,
            flatObjectMetadataMaps,
          }),
        existingFlatObjectMetadataMaps,
      );

    const flatObjectMetadataMapsWithTargetRelationFlatFieldMetadatas =
      getSubFlatObjectMetadataMapsOutOfFlatFieldMetadatasOrThrow({
        flatFieldMetadatas: relationTargetFlatFieldMetadatas,
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
        relationTargetFlatFieldMetadatas.map(
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

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromFlatObjectMetadataMaps,
          toFlatObjectMetadataMaps,
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
      await this.workspaceMetadataCacheService.getExistingOrRecomputeFlatObjectMetadataMaps(
        {
          workspaceId,
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

    return createdFlatObjectMetadata;
  }
}
