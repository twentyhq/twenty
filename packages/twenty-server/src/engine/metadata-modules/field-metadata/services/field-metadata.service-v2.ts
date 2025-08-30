import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromString,
} from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { type DeleteOneFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/delete-field.input';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { fromCreateFieldInputToFlatFieldMetadatasToCreate } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-create-field-input-to-flat-field-metadatas-to-create.util';
import { fromDeleteFieldInputToFlatFieldMetadatasToDelete } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-delete-field-input-to-flat-field-metadatas-to-delete.util';
import { fromFlatFieldMetadataToFieldMetadataDto } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-flat-field-metadata-to-field-metadata-dto.util';
import { fromUpdateFieldInputToFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-update-field-input-to-flat-field-metadata.util';
import { throwOnFieldInputTranspilationsError } from 'src/engine/metadata-modules/flat-field-metadata/utils/throw-on-field-input-transpilations-error.util';
import { addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { deleteFieldFromFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-field-from-flat-object-metadata-maps-or-throw.util';
import { getSubFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/get-sub-flat-object-metadata-maps-or-throw.util';
import { replaceFlatFieldMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/replace-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class FieldMetadataServiceV2 {
  constructor(
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {}

  async createOne({
    fieldMetadataInput,
    workspaceId,
  }: {
    fieldMetadataInput: Omit<CreateFieldInput, 'workspaceId'>;
    workspaceId: string;
  }): Promise<FieldMetadataEntity> {
    const [createdFieldMetadata] = await this.createMany({
      fieldMetadataInputs: [fieldMetadataInput],
      workspaceId,
    });

    if (!isDefined(createdFieldMetadata)) {
      throw new FieldMetadataException(
        'Failed to create field metadata',
        FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    return createdFieldMetadata;
  }

  public async deleteOneField({
    deleteOneFieldInput,
    workspaceId,
  }: {
    deleteOneFieldInput: DeleteOneFieldInput;
    workspaceId: string;
  }): Promise<FieldMetadataDTO> {
    const { flatObjectMetadataMaps: existingFlatObjectMetadataMaps } =
      await this.workspaceMetadataCacheService.getExistingOrRecomputeFlatObjectMetadataMaps(
        {
          workspaceId,
        },
      );

    const flatFieldMetadatasToDelete =
      fromDeleteFieldInputToFlatFieldMetadatasToDelete({
        deleteOneFieldInput,
        existingFlatObjectMetadataMaps,
      });

    const flatObjectMetadataMapsWithImpactedObject =
      getSubFlatObjectMetadataMapsOrThrow({
        flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
        objectMetadataIds: flatFieldMetadatasToDelete.map(
          (flatFieldMetadataToDelete) =>
            flatFieldMetadataToDelete.objectMetadataId,
        ),
      });

    const toFlatObjectMetadataMaps = flatFieldMetadatasToDelete.reduce(
      (flatObjectMetadataMaps, flatFieldMetadataToDelete) =>
        deleteFieldFromFlatObjectMetadataMapsOrThrow({
          fieldMetadataId: flatFieldMetadataToDelete.id,
          flatObjectMetadataMaps,
          objectMetadataId: flatFieldMetadataToDelete.objectMetadataId,
        }),
      flatObjectMetadataMapsWithImpactedObject,
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingObjectFieldIndex: true,
          },
          fromFlatObjectMetadataMaps: flatObjectMetadataMapsWithImpactedObject,
          toFlatObjectMetadataMaps,
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting field',
      );
    }

    return fromFlatFieldMetadataToFieldMetadataDto(
      flatFieldMetadatasToDelete[0],
    );
  }

  async updateOne({
    updateFieldInput,
    workspaceId,
  }: {
    updateFieldInput: UpdateFieldInput;
    workspaceId: string;
  }): Promise<FieldMetadataEntity> {
    const { flatObjectMetadataMaps: existingFlatObjectMetadataMaps } =
      await this.workspaceMetadataCacheService.getExistingOrRecomputeFlatObjectMetadataMaps(
        { workspaceId },
      );

    const inputTranspilationResult = fromUpdateFieldInputToFlatFieldMetadata({
      existingFlatObjectMetadataMaps,
      updateFieldInput,
    });

    if (inputTranspilationResult.status === 'fail') {
      throw inputTranspilationResult.error;
    }

    const optimisticiallyUpdatedFlatFieldMetadata =
      inputTranspilationResult.result;

    const fromFlatObjectMetadataMaps = getSubFlatObjectMetadataMapsOrThrow({
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      objectMetadataIds: [
        optimisticiallyUpdatedFlatFieldMetadata.objectMetadataId,
      ],
    });
    const toFlatObjectMetadataMaps =
      replaceFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
        flatObjectMetadataMaps: fromFlatObjectMetadataMaps,
        flatFieldMetadata: optimisticiallyUpdatedFlatFieldMetadata,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromFlatObjectMetadataMaps,
          toFlatObjectMetadataMaps,
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingObjectFieldIndex: false,
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating field',
      );
    }

    return this.fieldMetadataRepository.findOneOrFail({
      where: {
        id: optimisticiallyUpdatedFlatFieldMetadata.id,
        workspaceId,
      },
    });
  }

  async createMany({
    fieldMetadataInputs,
    workspaceId,
  }: {
    fieldMetadataInputs: Omit<CreateFieldInput, 'workspaceId'>[];
    workspaceId: string;
  }): Promise<FieldMetadataEntity[]> {
    if (!fieldMetadataInputs.length) {
      return [];
    }

    const { flatObjectMetadataMaps: existingFlatObjectMetadataMaps } =
      await this.workspaceMetadataCacheService.getExistingOrRecomputeFlatObjectMetadataMaps(
        { workspaceId },
      );

    const allInputTranspilationsResults = (
      await Promise.all(
        fieldMetadataInputs.map(
          async (fieldMetadataInput) =>
            await fromCreateFieldInputToFlatFieldMetadatasToCreate({
              existingFlatObjectMetadataMaps,
              workspaceId,
              rawCreateFieldInput: fieldMetadataInput,
            }),
        ),
      )
    ).flat();

    throwOnFieldInputTranspilationsError(
      allInputTranspilationsResults,
      'Multiple validation errors occurred while creating field',
    );
    const flatFieldMetadatasToCreate = allInputTranspilationsResults.flatMap(
      ({ result }) => result,
    );

    const impactedObjectMetadataIds = Array.from(
      new Set(
        flatFieldMetadatasToCreate.map(
          (flatFieldMetadata) => flatFieldMetadata.objectMetadataId,
        ),
      ),
    );

    const fromFlatObjectMetadataMaps = getSubFlatObjectMetadataMapsOrThrow({
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      objectMetadataIds: impactedObjectMetadataIds,
    });
    const toFlatObjectMetadataMaps = flatFieldMetadatasToCreate.reduce(
      (flatObjectMetadataMaps, flatFieldMetadataToCreate) =>
        addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
          flatFieldMetadata: flatFieldMetadataToCreate,
          flatObjectMetadataMaps,
        }),
      getSubFlatObjectMetadataMapsOrThrow({
        flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
        objectMetadataIds: impactedObjectMetadataIds,
      }),
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromFlatObjectMetadataMaps,
          toFlatObjectMetadataMaps,
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingObjectFieldIndex: false,
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating fields',
      );
    }

    return this.fieldMetadataRepository.find({
      where: {
        name: In(
          fieldMetadataInputs.map((flatFieldMetadata) =>
            trimAndRemoveDuplicatedWhitespacesFromString(
              flatFieldMetadata.name,
            ),
          ),
        ),
        workspaceId,
      },
    });
  }
}
