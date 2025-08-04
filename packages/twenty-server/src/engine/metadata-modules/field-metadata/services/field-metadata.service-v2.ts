import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { MultipleMetadataValidationErrors } from 'src/engine/core-modules/error/multiple-metadata-validation-errors';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FlatFieldMetadataValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { fromCreateFieldInputToFlatFieldAndItsFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-create-field-input-to-flat-field-and-its-flat-object-metadata.util';
import { dispatchAndMergeFlatFieldMetadatasInFlatObjectMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/dispatch-and-merge-flat-field-metadatas-in-flat-object-metadatas.util';
import { fromObjectMetadataMapsToFlatObjectMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-object-metadata-maps-to-flat-object-metadatas.util';
import { removeFlatFieldMetadataFromFlatObjectMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/remove-flat-field-metadata-from-flat-object-metadatas.util';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';
import { WorkspaceMigrationRunnerV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-migration-runner-v2.service';

@Injectable()
export class FieldMetadataServiceV2 extends TypeOrmQueryService<FieldMetadataEntity> {
  constructor(
    @InjectRepository(FieldMetadataEntity, 'core')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly workspaceMigrationBuilderV2: WorkspaceMigrationBuilderV2Service,
    private readonly flatFieldMetadataValidatorService: FlatFieldMetadataValidatorService,
    private readonly workspaceMigrationRunnerV2Service: WorkspaceMigrationRunnerV2Service,
  ) {
    super(fieldMetadataRepository);
  }

  override async createOne(
    fieldMetadataInput: CreateFieldInput,
  ): Promise<FieldMetadataEntity> {
    const [createdFieldMetadata] = await this.createMany([fieldMetadataInput]);

    if (!isDefined(createdFieldMetadata)) {
      throw new FieldMetadataException(
        'Failed to create field metadata',
        FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    return createdFieldMetadata;
  }

  async createMany(
    fieldMetadataInputs: CreateFieldInput[],
  ): Promise<FieldMetadataEntity[]> {
    if (!fieldMetadataInputs.length) {
      return [];
    }

    const workspaceId = fieldMetadataInputs[0].workspaceId;

    const { objectMetadataMaps } =
      await this.workspaceMetadataCacheService.getExistingOrRecomputeMetadataMaps(
        { workspaceId },
      );

    const existingFlatObjectMetadatas =
      fromObjectMetadataMapsToFlatObjectMetadatas(objectMetadataMaps);

    const flatFieldMetadatasToCreate = (
      await Promise.all(
        fieldMetadataInputs.map(
          async (fieldMetadataInput) =>
            await fromCreateFieldInputToFlatFieldAndItsFlatObjectMetadata({
              existingFlatObjectMetadatas,
              rawCreateFieldInput: fieldMetadataInput,
            }),
        ),
      )
    ).flat();

    const optimisticRenderedFlatObjectMetadatas =
      dispatchAndMergeFlatFieldMetadatasInFlatObjectMetadatas({
        flatObjectMetadatas: existingFlatObjectMetadatas,
        flatFieldMetadatas: flatFieldMetadatasToCreate,
      });

    const flatFieldMetadataValidationPromises = flatFieldMetadatasToCreate.map(
      (flatFieldMetadataToValidate) =>
        this.flatFieldMetadataValidatorService.validateOneFlatFieldMetadata({
          existingFlatObjectMetadatas:
            removeFlatFieldMetadataFromFlatObjectMetadatas({
              flatFieldMetadata: flatFieldMetadataToValidate,
              flatObjectMetadatas: optimisticRenderedFlatObjectMetadatas,
            }),
          flatFieldMetadataToValidate,
          workspaceId,
        }),
    );

    const createdFlatFieldMetadataValidationResult = (
      await Promise.all(flatFieldMetadataValidationPromises)
    )
      .flat()
      .filter(isDefined);

    if (createdFlatFieldMetadataValidationResult.length > 0) {
      throw new MultipleMetadataValidationErrors(
        createdFlatFieldMetadataValidationResult,
        'Multiple validation errors occurred while creating field',
      );
    }

    const workspaceMigration = this.workspaceMigrationBuilderV2.build({
      objectMetadataFromToInputs: {
        from: existingFlatObjectMetadatas,
        to: optimisticRenderedFlatObjectMetadatas,
      },
      inferDeletionFromMissingObjectFieldIndex: false,
      workspaceId,
    });

    await this.workspaceMigrationRunnerV2Service.run(workspaceMigration);

    // TODO refactor once the runner has been refactored to return created entities
    return [];
  }
}
