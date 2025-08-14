import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { MultipleMetadataValidationErrors } from 'src/engine/core-modules/error/multiple-metadata-validation-errors';
import { EMPTY_FLAT_OBJECT_METADATA_MAPS } from 'src/engine/metadata-modules/flat-object-metadata-maps/constant/empty-flat-object-metadata-maps.constant';
import { addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-to-flat-object-metadata-maps-or-throw.util';
import { deleteFieldFromFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-field-from-flat-object-metadata-maps-or-throw.util';
import { deleteObjectFromFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-object-from-flat-object-metadata-maps-or-throw.util';
import { getSubFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/get-sub-flat-object-metadata-maps-or-throw.util';
import { replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/replace-flat-object-metadata-in-flat-object-metadata-maps-or-throw.util';
import { FlatObjectMetadataValidatorService } from 'src/engine/metadata-modules/flat-object-metadata/services/flat-object-metadata-validator.service';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromCreateObjectInputToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-create-object-input-to-flat-object-metadata.util';
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
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';
import { WorkspaceMigrationRunnerV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-migration-runner-v2.service';

@Injectable()
export class ObjectMetadataServiceV2 {
  constructor(
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly workspaceMigrationBuilderV2: WorkspaceMigrationBuilderV2Service,
    private readonly workspaceMigrationRunnerV2Service: WorkspaceMigrationRunnerV2Service,
    private readonly flatObjectMetadataValidatorService: FlatObjectMetadataValidatorService,
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

    const optimisticallyUpdatedFlatObjectMetadata =
      fromUpdateObjectInputToFlatObjectMetadata({
        existingFlatObjectMetadataMaps,
        updateObjectInput,
      });

    const validationErrors =
      this.flatObjectMetadataValidatorService.validateFlatObjectMetadataUpdate({
        existingFlatObjectMetadataMaps,
        updatedFlatObjectMetadata: optimisticallyUpdatedFlatObjectMetadata,
      });

    if (validationErrors.length > 0) {
      throw new MultipleMetadataValidationErrors(
        validationErrors,
        'Multiple validation errors occurred while updating object',
      );
    }

    try {
      const fromFlatObjectMetadataMaps = getSubFlatObjectMetadataMapsOrThrow({
        flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
        objectMetadataIds: [optimisticallyUpdatedFlatObjectMetadata.id],
      });
      const toFlatObjectMetadataMaps =
        replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow({
          flatObjectMetadata: optimisticallyUpdatedFlatObjectMetadata,
          flatObjectMetadataMaps: fromFlatObjectMetadataMaps,
        });
      const workspaceMigration = this.workspaceMigrationBuilderV2.build({
        fromFlatObjectMetadataMaps,
        toFlatObjectMetadataMaps,
        inferDeletionFromMissingObjectFieldIndex: false,
        workspaceId,
      });

      await this.workspaceMigrationRunnerV2Service.run(workspaceMigration);
    } catch {
      throw new ObjectMetadataException(
        'Workspace migration failed to run',
        ObjectMetadataExceptionCode.INTERNAL_SERVER_ERROR,
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

    const flatObjectDeleteValidationErrors =
      this.flatObjectMetadataValidatorService.validateFlatObjectMetadataDeletion(
        {
          existingFlatObjectMetadataMaps,
          objectMetadataToDeleteId,
        },
      );

    if (flatObjectDeleteValidationErrors.length > 0) {
      throw new MultipleMetadataValidationErrors(
        flatObjectDeleteValidationErrors,
        'Multiple validation errors occurred while deleting object',
      );
    }

    try {
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
      const workspaceMigration = this.workspaceMigrationBuilderV2.build({
        fromFlatObjectMetadataMaps,
        toFlatObjectMetadataMaps,
        inferDeletionFromMissingObjectFieldIndex: true,
        workspaceId,
      });

      await this.workspaceMigrationRunnerV2Service.run(workspaceMigration);
    } catch {
      throw new ObjectMetadataException(
        'Workspace migration failed to run',
        ObjectMetadataExceptionCode.INTERNAL_SERVER_ERROR,
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

    const flatObjectMetadataToCreate =
      fromCreateObjectInputToFlatObjectMetadata({
        createObjectInput,
        workspaceId,
      });

    const validationErrors =
      await this.flatObjectMetadataValidatorService.validateFlatObjectMetadataCreation(
        {
          existingFlatObjectMetadataMaps,
          flatObjectMetadataToValidate: flatObjectMetadataToCreate,
          workspaceId,
        },
      );

    if (validationErrors.length > 0) {
      throw new MultipleMetadataValidationErrors(
        validationErrors,
        'Multiple validation errors occurred while creating object',
      );
    }

    try {
      const workspaceMigration = this.workspaceMigrationBuilderV2.build({
        fromFlatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
        toFlatObjectMetadataMaps:
          addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow({
            flatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
            flatObjectMetadata: flatObjectMetadataToCreate,
          }),
        inferDeletionFromMissingObjectFieldIndex: false,
        workspaceId,
      });

      await this.workspaceMigrationRunnerV2Service.run(workspaceMigration);
    } catch {
      throw new ObjectMetadataException(
        'Workspace migration failed to run',
        ObjectMetadataExceptionCode.INTERNAL_SERVER_ERROR,
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
