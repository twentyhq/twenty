import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { MultipleMetadataValidationErrors } from 'src/engine/core-modules/error/multiple-metadata-validation-errors';
import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FlatFieldMetadataValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { type FailedFlatFieldMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { fromCreateFieldInputToFlatFieldAndItsFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-create-field-input-to-flat-field-and-its-flat-object-metadata.util';
import { isFlatFieldMetadataEntityOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { addFlatFieldMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-field-metadata-in-flat-object-metadata-maps.util';
import { extractFlatObjectMetadataMapsOutOfFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/extract-flat-object-metadata-maps-out-of-flat-object-metadata-maps-or-throw.util';
import { extractFlatObjectMetadataMapsOutOfFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/extract-flat-object-metadata-maps-out-of-flat-object-metadata-maps.util';
import { fromFlatObjectMetadataMapsToFlatObjectMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-maps-to-flat-object-metadatas.util';
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

  private computeOtherFlatObjectMetadataMapsToValidate({
    flatFieldMetadataToCreate,
    flatFieldMetadatasToCreate,
    flatObjectMetadataMaps,
  }: {
    flatObjectMetadataMaps: FlatObjectMetadataMaps;
    flatFieldMetadatasToCreate: FlatFieldMetadata[];
    flatFieldMetadataToCreate: FlatFieldMetadata;
  }): FlatObjectMetadataMaps | undefined {
    if (
      !isFlatFieldMetadataEntityOfType(
        flatFieldMetadataToCreate,
        FieldMetadataType.RELATION,
      ) &&
      !isFlatFieldMetadataEntityOfType(
        flatFieldMetadataToCreate,
        FieldMetadataType.MORPH_RELATION,
      )
    ) {
      return undefined;
    }
    const relatedFlatFieldMetadataToCreate = flatFieldMetadatasToCreate.find(
      (relatedFlatFieldMetadata) =>
        isFlatFieldMetadataEntityOfType(
          relatedFlatFieldMetadata,
          FieldMetadataType.RELATION,
        ) &&
        relatedFlatFieldMetadata.id ===
          flatFieldMetadataToCreate.relationTargetFieldMetadataId,
    );

    if (!isDefined(relatedFlatFieldMetadataToCreate)) {
      return undefined;
    }

    const flatObjectMetadataMapsWithRelatedObjectMetadata =
      extractFlatObjectMetadataMapsOutOfFlatObjectMetadataMaps({
        flatObjectMetadataMaps,
        objectMetadataIds: [relatedFlatFieldMetadataToCreate.objectMetadataId],
      });

    if (!isDefined(flatObjectMetadataMapsWithRelatedObjectMetadata)) {
      return undefined;
    }

    return addFlatFieldMetadataInFlatObjectMetadataMaps({
      flatFieldMetadata: relatedFlatFieldMetadataToCreate,
      flatObjectMetadataMaps: flatObjectMetadataMapsWithRelatedObjectMetadata,
    });
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

    const allValidationErrors: FailedFlatFieldMetadataValidationExceptions[] =
      [];
    let optimisticFlatObjectMetadataMaps = structuredClone(
      existingFlatObjectMetadataMaps,
    );

    for (const flatFieldMetadataToCreate of flatFieldMetadatasToCreate) {
      const otherFlatObjectMetadataMapsToValidate =
        this.computeOtherFlatObjectMetadataMapsToValidate({
          flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
          flatFieldMetadatasToCreate,
          flatFieldMetadataToCreate,
        });

      const validationErrors =
        await this.flatFieldMetadataValidatorService.validateOneFlatFieldMetadata(
          {
            existingFlatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
            flatFieldMetadataToValidate: flatFieldMetadataToCreate,
            workspaceId,
            otherFlatObjectMetadataMapsToValidate,
          },
        );

      if (validationErrors.length > 0) {
        allValidationErrors.push(...validationErrors);
        continue;
      }

      try {
        optimisticFlatObjectMetadataMaps =
          addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
            flatFieldMetadata: flatFieldMetadataToCreate,
            flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
          });
      } catch (e) {
        throw new FieldMetadataException(
          'Optimistic cache manipulation failed, should never occur',
          FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR,
        );
      }
    }

    if (allValidationErrors.length > 0) {
      throw new MultipleMetadataValidationErrors(
        allValidationErrors,
        'Multiple validation errors occurred while creating field',
      );
    }

    const impactedObjectMetadataIds = Array.from(
      new Set(
        flatFieldMetadatasToCreate.map(
          (flatFieldMetadata) => flatFieldMetadata.objectMetadataId,
        ),
      ),
    );

    try {
      const fromImpactedFlatObjectMetadataMaps =
        extractFlatObjectMetadataMapsOutOfFlatObjectMetadataMapsOrThrow({
          flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
          objectMetadataIds: impactedObjectMetadataIds,
        });
      const toImpactedFlatObjectMetadataMaps =
        extractFlatObjectMetadataMapsOutOfFlatObjectMetadataMapsOrThrow({
          flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
          objectMetadataIds: impactedObjectMetadataIds,
        });
      const workspaceMigration = this.workspaceMigrationBuilderV2.build({
        objectMetadataFromToInputs: {
          from: fromFlatObjectMetadataMapsToFlatObjectMetadatas(
            fromImpactedFlatObjectMetadataMaps,
          ),
          to: fromFlatObjectMetadataMapsToFlatObjectMetadatas(
            toImpactedFlatObjectMetadataMaps,
          ),
        },
        inferDeletionFromMissingObjectFieldIndex: false,
        workspaceId,
      });

      await this.workspaceMigrationRunnerV2Service.run(workspaceMigration);

      // TODO refactor once the runner has been refactored to return created entities
      return [];
    } catch {
      // TODO prastoin We should pass the internal error here
      throw new FieldMetadataException(
        'Workspace migration failed to run',
        FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
