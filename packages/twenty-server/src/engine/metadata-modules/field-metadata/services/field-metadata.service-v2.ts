import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { AggregateError } from 'src/engine/core-modules/error/aggregate-error';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FlatFieldMetadataValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { fromCreateFieldInputToFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-create-field-input-to-flat-field-metadata.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromObjectMetadataMapsToFlatObjectMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-object-metadata-maps-to-flat-object-metadatas.util';
import { mergeTwoFlatObjectMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/merge-two-flat-object-metadatas.util';
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

    let flatObjectMetadatasWithNewFields: FlatObjectMetadata[] = [];

    for (const fieldMetadataInput of fieldMetadataInputs) {
      const createdFlatFieldsMetadataAndParentFlatObjectMetadata =
        await fromCreateFieldInputToFlatFieldMetadata({
          existingFlatObjectMetadatas,
          rawCreateFieldInput: fieldMetadataInput,
        });

      const createdFlatFieldMetadataValidationResult = (
        await Promise.all(
          createdFlatFieldsMetadataAndParentFlatObjectMetadata.map(
            ({ flatFieldMetadata: flatFieldMetadataToValidate }) =>
              this.flatFieldMetadataValidatorService.validateOneFlatFieldMetadata(
                {
                  existingFlatObjectMetadatas,
                  flatFieldMetadataToValidate,
                  workspaceId,
                },
              ),
          ),
        )
      ).filter(isDefined);

      if (createdFlatFieldMetadataValidationResult.length > 0) {
        const errors = createdFlatFieldMetadataValidationResult.map(
          (validationResult) => validationResult.error,
        );

        throw new AggregateError(
          errors,
          'Multiple validation errors occurred while creating field',
        );
      }

      const updatedFlatObjectMetadatas =
        createdFlatFieldsMetadataAndParentFlatObjectMetadata.map<FlatObjectMetadata>(
          ({ flatFieldMetadata, parentFlatObjectMetadata }) => {
            return {
              ...parentFlatObjectMetadata,
              flatFieldMetadatas: [
                ...parentFlatObjectMetadata.flatFieldMetadatas,
                flatFieldMetadata,
              ],
            };
          },
        );

      flatObjectMetadatasWithNewFields = mergeTwoFlatObjectMetadatas({
        destFlatObjectMetadatas: flatObjectMetadatasWithNewFields,
        toMergeFlatObjectMetadatas: updatedFlatObjectMetadatas,
      });
    }

    const workspaceMigration = this.workspaceMigrationBuilderV2.build({
      objectMetadataFromToInputs: {
        from: existingFlatObjectMetadatas,
        to: flatObjectMetadatasWithNewFields,
      },
      inferDeletionFromMissingObjectFieldIndex: false,
      workspaceId,
    });

    await this.workspaceMigrationRunnerV2Service.run(workspaceMigration);

    // const recomputedCache =
    //   await this.workspaceMetadataCacheService.getExistingOrRecomputeMetadataMaps(
    //     { workspaceId },
    //   );

    return []; //TODO to retrieve from cache or directly from find
  }
}
