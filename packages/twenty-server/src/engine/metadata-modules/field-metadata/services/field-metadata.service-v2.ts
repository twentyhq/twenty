import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { FieldMetadataType } from 'twenty-shared/types';
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
import { FailedFlatFieldMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { fromCreateFieldInputToFlatFieldAndItsFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-create-field-input-to-flat-field-and-its-flat-object-metadata.util';
import { isFlatFieldMetadataEntityOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { mergeFlatFieldMetadatasInFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/merge-flat-field-metadatas-in-flat-object-metadata.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { dispatchAndMergeFlatFieldMetadatasInFlatObjectMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/dispatch-and-merge-flat-field-metadatas-in-flat-object-metadatas.util';
import { fromFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-with-flat-field-maps-to-flat-object-metadatas.util';
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

    const { flatObjectMetadataMaps: existingFlatObjectMetadataMaps } =
      await this.workspaceMetadataCacheService.getExistingOrRecomputeFlatObjectMetadataMaps(
        { workspaceId },
      );

    const flatFieldMetadatasToCreate = (
      await Promise.all(
        fieldMetadataInputs.map(
          async (fieldMetadataInput) =>
            await fromCreateFieldInputToFlatFieldAndItsFlatObjectMetadata({
              existingFlatObjectMetadataMaps,
              rawCreateFieldInput: fieldMetadataInput,
            }),
        ),
      )
    ).flat();

    const existingFlatObjectMetadatas = Object.values(
      existingFlatObjectMetadataMaps.byId,
    ).map(fromFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadata);

    const impactedObjectMetadataIds = Array.from(
      new Set(
        flatFieldMetadatasToCreate.map(
          (flatFieldMetadata) => flatFieldMetadata.objectMetadataId,
        ),
      ),
    );
    const filterFlatObjectMetadatasByImpactedIds = (
      flatObjectMetadatas: FlatObjectMetadata[],
    ) =>
      flatObjectMetadatas.filter((flatObjectMetadata) =>
        impactedObjectMetadataIds.includes(flatObjectMetadata.id),
      );
    const impactedExistingFlatObjectMetadatas =
      filterFlatObjectMetadatasByImpactedIds(existingFlatObjectMetadatas);

    const allValidationErrors: FailedFlatFieldMetadataValidationExceptions[] =
      [];
    let sequentiallyOptimisticallyRenderedFlatObjectMetadatas = structuredClone(
      existingFlatObjectMetadatas,
    );

    for (const flatFieldMetadataToCreate of flatFieldMetadatasToCreate) {
      let otherFlatObjectMetadataToValidate: FlatObjectMetadata | undefined =
        undefined;

      if (
        isFlatFieldMetadataEntityOfType(
          flatFieldMetadataToCreate,
          FieldMetadataType.RELATION,
        ) ||
        isFlatFieldMetadataEntityOfType(
          flatFieldMetadataToCreate,
          FieldMetadataType.MORPH_RELATION,
        )
      ) {
        const relatedFlatFieldMetadataToCreate =
          flatFieldMetadatasToCreate.find(
            (relatedFlatFieldMetadata) =>
              isFlatFieldMetadataEntityOfType(
                relatedFlatFieldMetadata,
                FieldMetadataType.RELATION,
              ) &&
              relatedFlatFieldMetadata.id ===
                flatFieldMetadataToCreate.relationTargetFieldMetadataId,
          );
        const relatedFlatObjectMetadata = isDefined(
          relatedFlatFieldMetadataToCreate,
        )
          ? existingFlatObjectMetadataMaps.byId[
              relatedFlatFieldMetadataToCreate.objectMetadataId
            ]
          : undefined;

        otherFlatObjectMetadataToValidate =
          isDefined(relatedFlatObjectMetadata) &&
          isDefined(relatedFlatFieldMetadataToCreate)
            ? mergeFlatFieldMetadatasInFlatObjectMetadata({
                flatFieldMetadatas: [relatedFlatFieldMetadataToCreate],
                flatObjectMetadata: relatedFlatObjectMetadata,
              })
            : undefined;
      }

      const validationErrors =
        await this.flatFieldMetadataValidatorService.validateOneFlatFieldMetadata(
          {
            existingFlatObjectMetadatas:
              sequentiallyOptimisticallyRenderedFlatObjectMetadatas,
            flatFieldMetadataToValidate: flatFieldMetadataToCreate,
            workspaceId,
            othersFlatObjectMetadataToValidate: isDefined(
              otherFlatObjectMetadataToValidate,
            )
              ? [otherFlatObjectMetadataToValidate]
              : undefined,
          },
        );

      if (validationErrors.length > 0) {
        allValidationErrors.push(...validationErrors);
        continue;
      }

      sequentiallyOptimisticallyRenderedFlatObjectMetadatas =
        dispatchAndMergeFlatFieldMetadatasInFlatObjectMetadatas({
          flatFieldMetadatas: [flatFieldMetadataToCreate],
          flatObjectMetadatas:
            sequentiallyOptimisticallyRenderedFlatObjectMetadatas,
        });
    }

    if (allValidationErrors.length > 0) {
      throw new MultipleMetadataValidationErrors(
        allValidationErrors,
        'Multiple validation errors occurred while creating field',
      );
    }

    const workspaceMigration = this.workspaceMigrationBuilderV2.build({
      objectMetadataFromToInputs: {
        from: impactedExistingFlatObjectMetadatas,
        to: filterFlatObjectMetadatasByImpactedIds(
          sequentiallyOptimisticallyRenderedFlatObjectMetadatas,
        ),
      },
      inferDeletionFromMissingObjectFieldIndex: false,
      workspaceId,
    });

    await this.workspaceMigrationRunnerV2Service.run(workspaceMigration);

    // TODO refactor once the runner has been refactored to return created entities
    return [];
  }
}
