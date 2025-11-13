import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
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
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { computeFlatEntityMapsFromTo } from 'src/engine/metadata-modules/flat-entity/utils/compute-flat-entity-maps-from-to.util';
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
    isSystemBuild = false,
  }: {
    deleteOneFieldInput: DeleteOneFieldInput;
    workspaceId: string;
    isSystemBuild?: boolean;
  }): Promise<FieldMetadataDTO> {
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
      flatIndexesToDelete,
      flatIndexesToUpdate,
    } = fromDeleteFieldInputToFlatFieldMetadatasToDelete({
      deleteOneFieldInput,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
      flatIndexMaps: existingFlatIndexMaps,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          dependencyAllFlatEntityMaps: {
            flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
          },
          buildOptions: {
            isSystemBuild,
            inferDeletionFromMissingEntities: {
              fieldMetadata: true,
              index: true,
            },
          },
          fromToAllFlatEntityMaps: {
            flatFieldMetadataMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatFieldMetadataMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: flatFieldMetadatasToDelete,
              flatEntityToUpdate: [],
            }),
            flatIndexMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatIndexMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: flatIndexesToDelete,
              flatEntityToUpdate: flatIndexesToUpdate,
            }),
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
    updateFieldInput: Omit<UpdateFieldInput, 'workspaceId'>;
    workspaceId: string;
  }): Promise<FieldMetadataEntity> {
    const {
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      flatIndexMaps: existingFlatIndexMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
      flatViewFilterMaps: existingFlatViewFilterMaps,
      flatViewGroupMaps: existingFlatViewGroupMaps,
      flatViewMaps: existingFlatViewMaps,
      flatViewFieldMaps: existingFlatViewFieldMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatObjectMetadataMaps',
          'flatIndexMaps',
          'flatFieldMetadataMaps',
          'flatViewFilterMaps',
          'flatViewGroupMaps',
          'flatViewMaps',
          'flatViewFieldMaps',
        ],
      },
    );

    const inputTranspilationResult = fromUpdateFieldInputToFlatFieldMetadata({
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
      flatIndexMaps: existingFlatIndexMaps,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      updateFieldInput: { ...updateFieldInput, workspaceId },
      flatViewFilterMaps: existingFlatViewFilterMaps,
      flatViewGroupMaps: existingFlatViewGroupMaps,
      flatViewMaps: existingFlatViewMaps,
      flatViewFieldMaps: existingFlatViewFieldMaps,
    });

    if (inputTranspilationResult.status === 'fail') {
      throw new FieldMetadataException(
        inputTranspilationResult.error.message,
        inputTranspilationResult.error.code,
        {
          userFriendlyMessage:
            inputTranspilationResult.error.userFriendlyMessage,
        },
      );
    }

    const {
      flatFieldMetadatasToUpdate,
      flatIndexMetadatasToUpdate,
      flatIndexMetadatasToDelete,
      flatIndexMetadatasToCreate,
      flatViewGroupsToCreate,
      flatViewGroupsToDelete,
      flatViewGroupsToUpdate,
      flatViewFiltersToDelete,
      flatViewFiltersToUpdate,
      flatViewFieldsToDelete,
      flatViewsToUpdate,
      flatViewsToDelete,
    } = inputTranspilationResult.result;

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          dependencyAllFlatEntityMaps: {
            flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
            flatViewMaps: existingFlatViewMaps,
          },
          fromToAllFlatEntityMaps: {
            flatFieldMetadataMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatFieldMetadataMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: flatFieldMetadatasToUpdate,
            }),
            flatIndexMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatIndexMaps,
              flatEntityToCreate: flatIndexMetadatasToCreate,
              flatEntityToDelete: flatIndexMetadatasToDelete,
              flatEntityToUpdate: flatIndexMetadatasToUpdate,
            }),
            flatViewFilterMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewFilterMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: flatViewFiltersToDelete,
              flatEntityToUpdate: flatViewFiltersToUpdate,
            }),
            flatViewGroupMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewGroupMaps,
              flatEntityToCreate: flatViewGroupsToCreate,
              flatEntityToDelete: flatViewGroupsToDelete,
              flatEntityToUpdate: flatViewGroupsToUpdate,
            }),
            flatViewMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: flatViewsToDelete,
              flatEntityToUpdate: flatViewsToUpdate,
            }),
            flatViewFieldMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewFieldMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: flatViewFieldsToDelete,
              flatEntityToUpdate: [],
            }),
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: {
              index: true,
              viewGroup: true,
              viewFilter: true,
              view: true,
            },
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
        id: flatFieldMetadatasToUpdate[0].id,
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
        flatMapsKeys: [
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

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          dependencyAllFlatEntityMaps: {
            flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
          },
          fromToAllFlatEntityMaps: {
            flatFieldMetadataMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatFieldMetadataMaps,
              flatEntityToCreate: flatFieldMetadatasToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            }),
            flatIndexMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatIndexMaps,
              flatEntityToCreate: flatIndexMetadatasToCreate,
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
