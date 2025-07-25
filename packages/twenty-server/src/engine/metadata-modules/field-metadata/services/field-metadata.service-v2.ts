import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { DataSource, Repository } from 'typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataRelatedRecordsService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-related-records.service';
import { FlatFieldMetadataValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { fromCreateFieldInputToFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-create-field-input-to-flat-field-metadata.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromObjectMetadataMapsToFlatObjectMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-object-metadata-maps-to-flat-object-metadatas.util';
import { mergeTwoFlatObjectMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/merge-two-flat-object-metadatas.util';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';
import { WorkspaceMigrationRunnerV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-migration-runner-v2.service';

@Injectable()
export class FieldMetadataService extends TypeOrmQueryService<FieldMetadataEntity> {
  constructor(
    @InjectDataSource('core')
    private readonly coreDataSource: DataSource,
    @InjectRepository(FieldMetadataEntity, 'core')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    private readonly fieldMetadataRelatedRecordsService: FieldMetadataRelatedRecordsService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly featureFlagService: FeatureFlagService,
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

    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspaceId,
      );

    if (isWorkspaceMigrationV2Enabled) {
      throw new Error('Should not be used at all');
    }

    const { objectMetadataMaps } =
      await this.workspaceMetadataCacheService.getExistingOrRecomputeMetadataMaps(
        { workspaceId },
      );

    const existingFlatObjectMetadatas =
      fromObjectMetadataMapsToFlatObjectMetadatas(objectMetadataMaps);

    let flatObjectMetadatasWithNewFields: FlatObjectMetadata[] = [];
    for (const fieldMetadataInput of fieldMetadataInputs) {
      const createdFlatFieldsMetadataAndParentFlatObjectMetadata =
        fromCreateFieldInputToFlatFieldMetadata({
          existingFlatObjectMetadatas,
          rawCreateFieldInput: fieldMetadataInput,
        });

      const createdFlatFieldMetadataValidationResult = await Promise.all(
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
      );

      // TODO refactor in util
      if (
        createdFlatFieldMetadataValidationResult.some(
          (el) => el.status === 'fail',
        )
      ) {
        throw new Error('TODO prastoin handle validation reporter formatting');
      }
      ///

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

    const workpsaceMigration = this.workspaceMigrationBuilderV2.build({
      objectMetadataFromToInputs: {
        from: existingFlatObjectMetadatas,
        to: flatObjectMetadatasWithNewFields,
      },
      inferDeletionFromMissingObjectOrField: false,
      workspaceId,
    });

    await this.workspaceMigrationRunnerV2Service.run(workpsaceMigration);

    // const recomputedCache =
    //   await this.workspaceMetadataCacheService.getExistingOrRecomputeMetadataMaps(
    //     { workspaceId },
    //   );

    return []; //TODO to retrieve from cache or directly from find
  }
}
