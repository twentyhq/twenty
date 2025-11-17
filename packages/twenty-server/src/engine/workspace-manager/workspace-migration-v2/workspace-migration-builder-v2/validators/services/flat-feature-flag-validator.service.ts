import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagExceptionCode } from 'src/engine/core-modules/feature-flag/exceptions/feature-flag.exception';
import { FlatFeatureFlag } from 'src/engine/core-modules/feature-flag/types/flat-feature-flag.type';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class FlatFeatureFlagValidatorService {
  constructor() {}

  public validateFlatFeatureFlagUpdate({
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatFeatureFlagMaps: optimisticFlatFeatureFlagMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.featureFlag
  >): FailedFlatEntityValidation<FlatFeatureFlag> {
    const validationResult: FailedFlatEntityValidation<FlatFeatureFlag> = {
      type: 'update_feature_flag',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatEntityId,
      },
    };

    const existingFlatFeatureFlag =
      optimisticFlatFeatureFlagMaps.byId[flatEntityId];

    if (!isDefined(existingFlatFeatureFlag)) {
      validationResult.errors.push({
        code: FeatureFlagExceptionCode.FEATURE_FLAG_NOT_FOUND,
        message: t`Feature flag not found`,
        userFriendlyMessage: msg`Feature flag not found`,
      });

      return validationResult;
    }

    const updatedFlatFeatureFlag = {
      ...existingFlatFeatureFlag,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      }),
    };

    if (!Object.values(FeatureFlagKey).includes(updatedFlatFeatureFlag.key)) {
      validationResult.errors.push({
        code: FeatureFlagExceptionCode.FEATURE_FLAG_INVALID_KEY,
        message: t`Feature flag key is not valid`,
        userFriendlyMessage: msg`Invalid feature flag key`,
      });
    }

    return validationResult;
  }

  public validateFlatFeatureFlagDeletion({
    flatEntityToValidate: { id: featureFlagIdToDelete },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatFeatureFlagMaps: optimisticFlatFeatureFlagMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.featureFlag
  >): FailedFlatEntityValidation<FlatFeatureFlag> {
    const validationResult: FailedFlatEntityValidation<FlatFeatureFlag> = {
      type: 'delete_feature_flag',
      errors: [],
      flatEntityMinimalInformation: {
        id: featureFlagIdToDelete,
      },
    };

    const existingFlatFeatureFlag =
      optimisticFlatFeatureFlagMaps.byId[featureFlagIdToDelete];

    if (!isDefined(existingFlatFeatureFlag)) {
      validationResult.errors.push({
        code: FeatureFlagExceptionCode.FEATURE_FLAG_NOT_FOUND,
        message: t`Feature flag not found`,
        userFriendlyMessage: msg`Feature flag not found`,
      });
    }

    return validationResult;
  }

  public async validateFlatFeatureFlagCreation({
    flatEntityToValidate: flatFeatureFlagToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatFeatureFlagMaps: optimisticFlatFeatureFlagMaps,
    },
  }: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.featureFlag>): Promise<
    FailedFlatEntityValidation<FlatFeatureFlag>
  > {
    const validationResult: FailedFlatEntityValidation<FlatFeatureFlag> = {
      type: 'create_feature_flag',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatFeatureFlagToValidate.id,
      },
    };

    if (
      isDefined(
        optimisticFlatFeatureFlagMaps.byId[flatFeatureFlagToValidate.id],
      )
    ) {
      validationResult.errors.push({
        code: FeatureFlagExceptionCode.FEATURE_FLAG_ALREADY_EXISTS,
        message: t`Feature flag with same id already exists`,
        userFriendlyMessage: msg`Feature flag already exists`,
      });
    }

    const existingFeatureFlagWithSameKey = Object.values(
      optimisticFlatFeatureFlagMaps.byId,
    ).find(
      (ff) =>
        ff?.key === flatFeatureFlagToValidate.key &&
        ff?.workspaceId === flatFeatureFlagToValidate.workspaceId,
    );

    if (isDefined(existingFeatureFlagWithSameKey)) {
      const flatFeatureFlagToValidateKey = flatFeatureFlagToValidate.key;

      validationResult.errors.push({
        code: FeatureFlagExceptionCode.FEATURE_FLAG_ALREADY_EXISTS,
        message: t`Feature flag with key ${flatFeatureFlagToValidateKey} already exists in this workspace`,
        userFriendlyMessage: msg`Feature flag with this key already exists`,
      });
    }

    if (
      !Object.values(FeatureFlagKey).includes(flatFeatureFlagToValidate.key)
    ) {
      validationResult.errors.push({
        code: FeatureFlagExceptionCode.FEATURE_FLAG_INVALID_KEY,
        message: t`Feature flag key is not valid`,
        userFriendlyMessage: msg`Invalid feature flag key`,
      });
    }

    return validationResult;
  }
}
