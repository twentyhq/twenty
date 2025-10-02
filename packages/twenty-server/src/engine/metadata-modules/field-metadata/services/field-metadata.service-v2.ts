import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { EMPTY_FLAT_ENTITY_MAPS } from 'src/engine/core-modules/common/constant/empty-flat-entity-maps.constant';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { getSubFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/get-sub-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
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
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class FieldMetadataServiceV2 {
  constructor(
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {}

  async createOne({
    createFieldInput,
    workspaceId,
  }: {
    createFieldInput: Omit<CreateFieldInput, 'workspaceId'>;
    workspaceId: string;
  }): Promise<FieldMetadataEntity> {
    const [createdFieldMetadata] = await this.createMany({
      workspaceId,
      createFieldInputs: [createFieldInput],
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
      flatIndexesToDelete,
      flatIndexesToUpdate,
    } = fromDeleteFieldInputToFlatFieldMetadatasToDelete({
      deleteOneFieldInput,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
      flatIndexMaps: existingFlatIndexMaps,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
    });

    const fromFlatFieldMetadataMaps = getSubFlatEntityMapsOrThrow({
      flatEntityMaps: existingFlatFieldMetadataMaps,
      flatEntityIds: [
        ...new Set(flatFieldMetadatasToDelete.map((flatField) => flatField.id)),
      ],
    });

    const toFlatFieldMetadataMaps = flatFieldMetadatasToDelete.reduce(
      (flatFieldMetadataMaps, flatFieldMetadataToDelete) =>
        deleteFlatEntityFromFlatEntityMapsOrThrow({
          entityToDeleteId: flatFieldMetadataToDelete.id,
          flatEntityMaps: flatFieldMetadataMaps,
        }),
      fromFlatFieldMetadataMaps,
    );

    const fromFlatIndexMaps = getSubFlatEntityMapsOrThrow({
      flatEntityIds: [...flatIndexesToUpdate, ...flatIndexesToDelete].map(
        ({ id }) => id,
      ),
      flatEntityMaps: existingFlatIndexMaps,
    });
    const toFlatIndexMapsWithUpdatedFlatIndex = flatIndexesToUpdate.reduce(
      (flatIndexMaps, flatIndex) =>
        replaceFlatEntityInFlatEntityMapsOrThrow({
          flatEntity: flatIndex,
          flatEntityMaps: flatIndexMaps,
        }),
      fromFlatIndexMaps,
    );
    const toFlatIndexMaps = flatIndexesToDelete.reduce(
      (flatIndexMaps, flatIndex) =>
        deleteFlatEntityFromFlatEntityMapsOrThrow({
          entityToDeleteId: flatIndex.id,
          flatEntityMaps: flatIndexMaps,
        }),
      toFlatIndexMapsWithUpdatedFlatIndex,
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          dependencyAllFlatEntityMaps: {
            flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: true,
          },
          fromToAllFlatEntityMaps: {
            flatFieldMetadataMaps: {
              from: fromFlatFieldMetadataMaps,
              to: toFlatFieldMetadataMaps,
            },
            flatIndexMaps: {
              from: fromFlatIndexMaps,
              to: toFlatIndexMaps,
            },
          },
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

    const inputTranspilationResult = fromUpdateFieldInputToFlatFieldMetadata({
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
      flatIndexMaps: existingFlatIndexMaps,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      updateFieldInput,
    });

    if (inputTranspilationResult.status === 'fail') {
      throw inputTranspilationResult.error;
    }

    const {
      flatFieldMetadatasToUpdate: optimisticallyUpdatedFlatFieldMetadatas,
      flatIndexMetadatasToUpdate,
    } = inputTranspilationResult.result;

    const toFlatFieldMetadataMaps =
      optimisticallyUpdatedFlatFieldMetadatas.reduce(
        (flatFieldMaps, flatFieldMetadata) =>
          replaceFlatEntityInFlatEntityMapsOrThrow({
            flatEntityMaps: flatFieldMaps,
            flatEntity: flatFieldMetadata,
          }),
        getSubFlatEntityMapsOrThrow({
          flatEntityIds: optimisticallyUpdatedFlatFieldMetadatas.map(
            ({ id }) => id,
          ),
          flatEntityMaps: existingFlatFieldMetadataMaps,
        }),
      );

    const toFlatIndexMaps = flatIndexMetadatasToUpdate.reduce(
      (flatIndexMaps, flatIndexMetadata) =>
        replaceFlatEntityInFlatEntityMapsOrThrow({
          flatEntity: flatIndexMetadata,
          flatEntityMaps: flatIndexMaps,
        }),
      getSubFlatEntityMapsOrThrow({
        flatEntityIds: flatIndexMetadatasToUpdate.map(({ id }) => id),
        flatEntityMaps: existingFlatIndexMaps,
      }),
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          dependencyAllFlatEntityMaps: {
            flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
          },
          fromToAllFlatEntityMaps: {
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
        'Multiple validation errors occurred while updating field',
      );
    }

    return this.fieldMetadataRepository.findOneOrFail({
      where: {
        id: optimisticallyUpdatedFlatFieldMetadatas[0].id,
        workspaceId,
      },
    });
  }

  async createMany({
    createFieldInputs,
    workspaceId,
  }: {
    createFieldInputs: Omit<CreateFieldInput, 'workspaceId'>[];
    workspaceId: string;
  }): Promise<FieldMetadataEntity[]> {
    if (createFieldInputs.length === 0) {
      return [];
    }

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

    const allTranspiledTranspilationInputs: Awaited<
      ReturnType<typeof fromCreateFieldInputToFlatFieldMetadatasToCreate>
    >[] = [];

    for (const createFieldInput of createFieldInputs) {
      allTranspiledTranspilationInputs.push(
        await fromCreateFieldInputToFlatFieldMetadatasToCreate({
          flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
          createFieldInput,
          workspaceId,
        }),
      );
    }

    throwOnFieldInputTranspilationsError(
      allTranspiledTranspilationInputs,
      'Multiple validation errors occurred while creating field',
    );

    const {
      flatFieldMetadatas: flatFieldMetadatasToCreate,
      indexMetadatas: flatIndexMetadatasToCreate,
    } = allTranspiledTranspilationInputs.reduce(
      (acc, { result }) => ({
        flatFieldMetadatas: [
          ...acc.flatFieldMetadatas,
          ...result.flatFieldMetadatas,
        ],
        indexMetadatas: [...acc.indexMetadatas, ...result.indexMetadatas],
      }),
      { flatFieldMetadatas: [], indexMetadatas: [] },
    );

    const toFlatFieldMetadataMaps = flatFieldMetadatasToCreate.reduce(
      (flatFieldMaps, flatFieldMetadataToCreate) =>
        addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: flatFieldMetadataToCreate,
          flatEntityMaps: flatFieldMaps,
        }),
      EMPTY_FLAT_ENTITY_MAPS,
    );

    const toFlatIndexMaps = flatIndexMetadatasToCreate.reduce(
      (flatIndexMaps, flatIndex) =>
        addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: flatIndex,
          flatEntityMaps: flatIndexMaps,
        }),
      EMPTY_FLAT_ENTITY_MAPS,
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          dependencyAllFlatEntityMaps: {
            flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
          },
          fromToAllFlatEntityMaps: {
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
        'Multiple validation errors occurred while creating fields',
      );
    }

    return this.fieldMetadataRepository.find({
      where: {
        id: In(
          allTranspiledTranspilationInputs.map(
            ({ result: { flatFieldMetadatas } }) => flatFieldMetadatas[0].id,
          ),
        ),
        workspaceId,
      },
    });
  }
}
