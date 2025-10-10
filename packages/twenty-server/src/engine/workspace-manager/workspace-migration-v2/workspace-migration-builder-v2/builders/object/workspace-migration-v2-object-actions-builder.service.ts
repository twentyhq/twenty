import { Injectable } from '@nestjs/common';

import { ALL_FLAT_ENTITY_CONFIGURATION } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-configuration.constant';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { compareTwoFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/compare-two-flat-object-metadata.util';
import { UpdateObjectAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/object/types/workspace-migration-object-action-v2';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatObjectMetadataValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-object-metadata-validator.service';

export type ObjectMetadataRelatedFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  (typeof ALL_FLAT_ENTITY_CONFIGURATION.objectMetadata.relatedFlatEntityMapsKeys)[number]
>;
const OBJECT_METADATA_METADATA_NAME = 'objectMetadata' as const satisfies AllMetadataName;
@Injectable()
export class WorkspaceMigrationV2ObjectActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof OBJECT_METADATA_METADATA_NAME
> {
  constructor(
    private readonly flatObjectValidatorService: FlatObjectMetadataValidatorService,
  ) {
    super(OBJECT_METADATA_METADATA_NAME);
  }

  protected async validateFlatEntityCreation({
    flatEntityToValidate: flatObjectMetadataToValidate,
    optimisticFlatEntityMaps: optimisticFlatObjectMetadataMaps,
    buildOptions,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityValidationArgs<typeof OBJECT_METADATA_METADATA_NAME>): Promise<
    FlatEntityValidationReturnType<typeof OBJECT_METADATA_METADATA_NAME, 'created'>
  > {
    const validationResult =
      await this.flatObjectValidatorService.validateFlatObjectMetadataCreation({
        buildOptions,
        flatObjectMetadataToValidate,
        optimisticFlatObjectMetadataMaps,
        dependencyOptimisticFlatEntityMaps,
      });

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'create_object',
        flatFieldMetadatas: [],
        flatObjectMetadata: flatObjectMetadataToValidate,
      },
      dependencyOptimisticFlatEntityMaps,
    };
  }

  protected async validateFlatEntityDeletion({
    buildOptions,
    flatEntityToValidate: flatObjectMetadataToValidate,
    optimisticFlatEntityMaps: optimisticFlatObjectMetadataMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityValidationArgs<typeof OBJECT_METADATA_METADATA_NAME>): Promise<
    FlatEntityValidationReturnType<typeof OBJECT_METADATA_METADATA_NAME, 'deleted'>
  > {
    const validationResult =
      this.flatObjectValidatorService.validateFlatObjectMetadataDeletion({
        buildOptions,
        flatObjectMetadataToValidate,
        optimisticFlatObjectMetadataMaps,
        dependencyOptimisticFlatEntityMaps,
      });

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'delete_object',
        objectMetadataId: flatObjectMetadataToValidate.id,
      },
      dependencyOptimisticFlatEntityMaps,
    };
  }

  protected async validateFlatEntityUpdate({
    buildOptions,
    flatEntityUpdate: {
      from: fromFlatObjectMetadata,
      to: toFlatObjectMetadata,
    },
    optimisticFlatEntityMaps: optimisticFlatObjectMetadataMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityUpdateValidationArgs<typeof OBJECT_METADATA_METADATA_NAME>): Promise<
    | FlatEntityValidationReturnType<typeof OBJECT_METADATA_METADATA_NAME, 'updated'>
    | undefined
  > {
    const flatObjectPropertiesUpdates = compareTwoFlatObjectMetadata({
      fromFlatObjectMetadata,
      toFlatObjectMetadata,
    });

    if (flatObjectPropertiesUpdates.length === 0) {
      return undefined;
    }

    const validationResult =
      this.flatObjectValidatorService.validateFlatObjectMetadataUpdate({
        buildOptions,
        flatObjectMetadataToValidate: toFlatObjectMetadata,
        optimisticFlatObjectMetadataMaps,
        dependencyOptimisticFlatEntityMaps,
        flatObjectPropertiesUpdates: flatObjectPropertiesUpdates,
      });

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const updateObjectAction: UpdateObjectAction = {
      type: 'update_object',
      objectMetadataId: toFlatObjectMetadata.id,
      updates: flatObjectPropertiesUpdates,
    };

    return {
      status: 'success',
      action: updateObjectAction,
      dependencyOptimisticFlatEntityMaps,
    };
  }
}
