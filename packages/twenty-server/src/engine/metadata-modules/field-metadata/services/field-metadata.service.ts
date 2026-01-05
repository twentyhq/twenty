import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { isDefined } from 'twenty-shared/utils';
import { type FindOneOptions, type Repository } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { type DeleteOneFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/delete-field.input';
import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { fromCreateFieldInputToFlatFieldMetadatasToCreate } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-create-field-input-to-flat-field-metadatas-to-create.util';
import { fromDeleteFieldInputToFlatFieldMetadatasToDelete } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-delete-field-input-to-flat-field-metadatas-to-delete.util';
import { fromUpdateFieldInputToFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-update-field-input-to-flat-field-metadata.util';
import { throwOnFieldInputTranspilationsError } from 'src/engine/metadata-modules/flat-field-metadata/utils/throw-on-field-input-transpilations-error.util';
import { EMPTY_ORCHESTRATOR_FAILURE_REPORT } from 'src/engine/workspace-manager/workspace-migration-v2/constant/empty-orchestrator-failure-report.constant';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class FieldMetadataService extends TypeOrmQueryService<FieldMetadataEntity> {
  constructor(
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly applicationService: ApplicationService,
  ) {
    super(fieldMetadataRepository);
  }

  async createOneField({
    createFieldInput,
    workspaceId,
    applicationId,
  }: {
    createFieldInput: Omit<CreateFieldInput, 'workspaceId'>;
    workspaceId: string;
    /**
     * @deprecated do not use call validateBuildAndRunWorkspaceMigration contextually
     * when interacting with another application than workspace custom one
     * */
    applicationId?: string;
  }): Promise<FlatFieldMetadata> {
    const [createdFieldMetadata] = await this.createManyFields({
      workspaceId,
      createFieldInputs: [createFieldInput],
      applicationId,
    });

    if (!isDefined(createdFieldMetadata)) {
      throw new FieldMetadataException(
        'Failed to create field metadata',
        FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    return createdFieldMetadata;
  }

  async deleteOneField({
    deleteOneFieldInput,
    workspaceId,
    isSystemBuild = false,
  }: {
    deleteOneFieldInput: DeleteOneFieldInput;
    workspaceId: string;
    isSystemBuild?: boolean;
  }): Promise<FlatFieldMetadata> {
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
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: flatFieldMetadatasToDelete,
              flatEntityToUpdate: [],
            },
            index: {
              flatEntityToCreate: [],
              flatEntityToDelete: flatIndexesToDelete,
              flatEntityToUpdate: flatIndexesToUpdate,
            },
          },
          workspaceId,
          isSystemBuild,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting field',
      );
    }

    return flatFieldMetadatasToDelete[0];
  }

  async updateOneField({
    updateFieldInput,
    workspaceId,
    isSystemBuild = false,
  }: {
    updateFieldInput: Omit<UpdateFieldInput, 'workspaceId'>;
    workspaceId: string;
    isSystemBuild?: boolean;
  }): Promise<FlatFieldMetadata> {
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

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
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
      workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
      isSystemBuild,
    });

    if (inputTranspilationResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderExceptionV2(
        {
          report: {
            ...EMPTY_ORCHESTRATOR_FAILURE_REPORT(),
            fieldMetadata: [
              {
                errors: inputTranspilationResult.errors,
                type: 'update',
                metadataName: 'fieldMetadata',
                flatEntityMinimalInformation: {
                  id: '',
                },
              },
            ],
          },
          status: 'fail',
        },
        'Validation errors occurred while updating field',
      );
    }

    const {
      flatFieldMetadatasToUpdate,
      flatFieldMetadatasToCreate,
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
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: flatFieldMetadatasToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: flatFieldMetadatasToUpdate,
            },
            index: {
              flatEntityToCreate: flatIndexMetadatasToCreate,
              flatEntityToDelete: flatIndexMetadatasToDelete,
              flatEntityToUpdate: flatIndexMetadatasToUpdate,
            },
            viewFilter: {
              flatEntityToCreate: [],
              flatEntityToDelete: flatViewFiltersToDelete,
              flatEntityToUpdate: flatViewFiltersToUpdate,
            },
            viewGroup: {
              flatEntityToCreate: flatViewGroupsToCreate,
              flatEntityToDelete: flatViewGroupsToDelete,
              flatEntityToUpdate: flatViewGroupsToUpdate,
            },
            view: {
              flatEntityToCreate: [],
              flatEntityToDelete: flatViewsToDelete,
              flatEntityToUpdate: flatViewsToUpdate,
            },
            viewField: {
              flatEntityToCreate: [],
              flatEntityToDelete: flatViewFieldsToDelete,
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating field',
      );
    }

    const { flatFieldMetadataMaps: recomputedFlatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatFieldMetadatasToUpdate[0].id,
      flatEntityMaps: recomputedFlatFieldMetadataMaps,
    });
  }

  async createManyFields({
    createFieldInputs,
    workspaceId,
    applicationId,
    isSystemBuild = false,
  }: {
    createFieldInputs: Omit<CreateFieldInput, 'workspaceId'>[];
    workspaceId: string;
    /**
     * @deprecated do not use call validateBuildAndRunWorkspaceMigration contextually
     * when interacting with another application than workspace custom one
     * */
    applicationId?: string;
    isSystemBuild?: boolean;
  }): Promise<FlatFieldMetadata[]> {
    if (createFieldInputs.length === 0) {
      return [];
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const { flatObjectMetadataMaps: existingFlatObjectMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
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
          workspaceCustomApplicationId:
            applicationId ?? workspaceCustomFlatApplication.id,
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
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: flatFieldMetadatasToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            index: {
              flatEntityToCreate: flatIndexMetadatasToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating fields',
      );
    }

    const { flatFieldMetadataMaps: recomputedFlatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps'],
        },
      );

    return findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityIds: allTranspiledTranspilationInputs.map(
        ({ result: { flatFieldMetadatas } }) => flatFieldMetadatas[0].id,
      ),
      flatEntityMaps: recomputedFlatFieldMetadataMaps,
    });
  }

  public async findOneWithinWorkspace(
    workspaceId: string,
    options: FindOneOptions<FieldMetadataEntity>,
  ) {
    const [fieldMetadata] = await this.fieldMetadataRepository.find({
      ...options,
      where: {
        ...options.where,
        workspaceId,
      },
    });

    return fieldMetadata;
  }
}
