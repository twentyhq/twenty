import { Injectable } from '@nestjs/common';

import { MultipleMetadataValidationErrors } from 'src/engine/core-modules/error/multiple-metadata-validation-errors';
import { FlatFieldMetadataValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { EMPTY_FLAT_OBJECT_METADATA_MAPS } from 'src/engine/metadata-modules/flat-object-metadata-maps/constant/empty-flat-object-metadata-maps.constant';
import { addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-to-flat-object-metadata-maps-or-throw.util';
import { FlatObjectMetadataValidatorService } from 'src/engine/metadata-modules/flat-object-metadata/services/flat-object-metadata-validator.service';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromCreateObjectInputToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-create-object-input-to-flat-object-metadata.util';
import { fromDeleteObjectInputToFlatFieldMetadatasToDelete } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-delete-object-input-to-flat-field-metadatas-to-delete.util';
import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { DeleteOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/delete-object.input';
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
    private readonly flatFieldMetadataValidatorService: FlatFieldMetadataValidatorService,
  ) {}

  async deleteOne({
    deleteObjectInput,
    workspaceId,
  }: {
    deleteObjectInput: DeleteOneObjectInput;
    workspaceId: string;
  }) {
    const { flatObjectMetadataMaps: existingFlatObjectMetadataMaps } =
      await this.workspaceMetadataCacheService.getExistingOrRecomputeFlatObjectMetadataMaps(
        {
          workspaceId,
        },
      );

    const { flatFieldMetadatasToDelete, objectMetadataToDeleteId } =
      fromDeleteObjectInputToFlatFieldMetadatasToDelete({
        deleteObjectInput,
        existingFlatObjectMetadataMaps,
      });

    const flatObjectDeleteValidationErrors =
      this.flatObjectMetadataValidatorService.validateFlatObjectMetadataDeletion(
        {
          existingFlatObjectMetadataMaps,
          objectMetadataToDeleteId,
        },
      );

    const flatFieldDeletionValidationErrors =
      flatFieldMetadatasToDelete.flatMap((flatFieldMetadataToDelete) =>
        this.flatFieldMetadataValidatorService.validateFlatFieldMetadataDeletion(
          {
            existingFlatObjectMetadataMaps,
            flatFieldMetadataToDelete,
          },
        ),
      );

    const allValidationErrors = [
      ...flatFieldDeletionValidationErrors,
      ...flatObjectDeleteValidationErrors,
    ];
    if (allValidationErrors.length > 0) {
      throw new MultipleMetadataValidationErrors(
        allValidationErrors,
        'Multiple validation errors occurred while deleting object',
      );
    }
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

    return flatObjectMetadataToCreate; // TODO retrieve from cache
  }
}
