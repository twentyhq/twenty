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
import { FailedFlatFieldMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { fromCreateFieldInputToFlatFieldAndItsFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-create-field-input-to-flat-field-and-its-flat-object-metadata.util';
import { mergeTwoFlatFieldMetadatas } from 'src/engine/metadata-modules/flat-field-metadata/utils/merge-two-flat-field-metadatas.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  FlatObjectAndFlatFieldsToCreate,
  fromFlatFieldAndFlatObjectMetadataArrayToFlatObjectAndFlatFieldsToCreate,
} from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-field-and-flat-object-metadata-array-to-flat-object-and-flat-fields-to-create.util';
import { fromObjectMetadataMapsToFlatObjectMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-object-metadata-maps-to-flat-object-metadatas.util';
import { mergeTwoFlatObjectMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/merge-two-flat-object-metadatas.util';
import { removeFlatFieldMetadataFromFlatObjectMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/remove-flat-field-metadata-from-flat-object-metadatas.util';
import { getFieldMetadataEntityFromCachedObjectMetadataMaps } from 'src/engine/metadata-modules/utils/get-field-metadata-entity-from-cached-object-metadata-maps.util';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';
import { WorkspaceMigrationRunnerV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-migration-runner-v2.service';

const optimisticallyApplyFlatFieldMetadataCreationToFlatObjectMetadata = (
  args: FlatObjectAndFlatFieldsToCreate[],
): FlatObjectMetadata[] => {
  return args.map(({ flatObjectMetadata, toCreateFlatFieldMetadata }) => {
    return {
      ...flatObjectMetadata,
      flatFieldMetadatas: mergeTwoFlatFieldMetadatas({
        destFlatFieldMetadatas: flatObjectMetadata.flatFieldMetadatas,
        toMergeFlatFieldMetadatas: toCreateFlatFieldMetadata,
      }),
    };
  });
};

type PrastoinArgs = {
  flatObjectAndFlatFieldsToCreate: FlatObjectAndFlatFieldsToCreate;
  optimisticRenderedFlatObjectMetadatas: FlatObjectMetadata[];
  workspaceId: string;
  existingFlatObjectMetadatas: FlatObjectMetadata[];
};
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

  private validateFlatFieldMetadatasToCreate = async ({
    flatObjectAndFlatFieldsToCreate: { toCreateFlatFieldMetadata },
    optimisticRenderedFlatObjectMetadatas,
    workspaceId,
    existingFlatObjectMetadatas,
  }: PrastoinArgs): Promise<FailedFlatFieldMetadataValidationExceptions[]> => {
    const validationPromises = toCreateFlatFieldMetadata.map<
      Promise<FailedFlatFieldMetadataValidationExceptions[]>
    >((flatFieldMetadataToValidate) => {
      const othersFlatObjectMetadataToValidate =
        removeFlatFieldMetadataFromFlatObjectMetadatas({
          flatFieldMetadata: flatFieldMetadataToValidate,
          flatObjectMetadatas: optimisticRenderedFlatObjectMetadatas,
        });

      return this.flatFieldMetadataValidatorService.validateOneFlatFieldMetadata(
        {
          existingFlatObjectMetadatas,
          flatFieldMetadataToValidate,
          workspaceId,
          othersFlatObjectMetadataToValidate,
        },
      );
    });

    return (await Promise.all(validationPromises)).flat();
  };

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

    const flatFieldToCreateAndItsFlatObjectMetadataArray = await Promise.all(
      fieldMetadataInputs.map(
        async (fieldMetadataInput) =>
          await fromCreateFieldInputToFlatFieldAndItsFlatObjectMetadata({
            existingFlatObjectMetadatas,
            rawCreateFieldInput: fieldMetadataInput,
          }),
      ),
    );

    const flatObjectAndFlatFieldToCreateCollection =
      flatFieldToCreateAndItsFlatObjectMetadataArray.map(
        fromFlatFieldAndFlatObjectMetadataArrayToFlatObjectAndFlatFieldsToCreate,
      );

    let flatObjectMetadatasWithNewFields: FlatObjectMetadata[] = [];

    for (const FlatFieldsToCreateAndItsParentFlatObject of flatObjectAndFlatFieldToCreateCollection) {
      const optimisticRenderedFlatObjectMetadatas =
        optimisticallyApplyFlatFieldMetadataCreationToFlatObjectMetadata(
          FlatFieldsToCreateAndItsParentFlatObject,
        );

      const flatFieldMetadataValidationPromises =
        FlatFieldsToCreateAndItsParentFlatObject.map(
          (flatObjectAndFlatFieldsToCreate) =>
            this.validateFlatFieldMetadatasToCreate({
              existingFlatObjectMetadatas,
              flatObjectAndFlatFieldsToCreate,
              optimisticRenderedFlatObjectMetadatas,
              workspaceId,
            }),
        );

      const createdFlatFieldMetadataValidationResult = (
        await Promise.all(flatFieldMetadataValidationPromises)
      )
        .flat()
        .filter(isDefined);

      if (createdFlatFieldMetadataValidationResult.length > 0) {
        const errors = createdFlatFieldMetadataValidationResult.flat();

        throw new MultipleMetadataValidationErrors(
          errors,
          'Multiple validation errors occurred while creating field',
        );
      }

      flatObjectMetadatasWithNewFields = mergeTwoFlatObjectMetadatas({
        destFlatObjectMetadatas: flatObjectMetadatasWithNewFields,
        toMergeFlatObjectMetadatas: optimisticRenderedFlatObjectMetadatas,
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

    const recomputedCache =
      await this.workspaceMetadataCacheService.getExistingOrRecomputeMetadataMaps(
        { workspaceId },
      );

    // TODO refactor with flatObjectAndFlatFieldToCreateCollection
    return flatFieldToCreateAndItsFlatObjectMetadataArray.flatMap<FieldMetadataEntity>(
      (createdFlatFieldAndItsParentFlatObject) => {
        return createdFlatFieldAndItsParentFlatObject
          .map(
            ({
              flatFieldMetadata: { id: fieldMetadataId },
              parentFlatObjectMetadata: { id: objectMetadataId },
            }) =>
              getFieldMetadataEntityFromCachedObjectMetadataMaps({
                fieldMetadataId,
                objectMetadataId,
                objectMetadataMaps: recomputedCache.objectMetadataMaps,
              }),
          )
          .filter(isDefined);
      },
    );
  }
}
