import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { type ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataOptionExceptionCode } from 'src/engine/metadata-modules/field-metadata-option/field-metadata-option.exception';
import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { isEnumUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import {
  validateMetadataOptionLabel,
  validateMetadataOptionValue,
} from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-enum-flat-field-metadata.util';
import { validateMetadataOptionColor } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-metadata-option-color.util';
import { type UniversalFlatFieldMetadataOption } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata-option.type';
import {
  type FailedFlatEntityValidation,
  type FlatEntityValidationError,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

type FieldMetadataOptionRelatedMaps = Pick<
  UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.fieldMetadataOption
  >['optimisticFlatEntityMapsAndRelatedFlatEntityMaps'],
  'flatFieldMetadataMaps' | 'flatFieldMetadataOptionMaps'
>;

const buildNotFoundError = (): FlatEntityValidationError => ({
  code: FieldMetadataOptionExceptionCode.FIELD_METADATA_OPTION_NOT_FOUND,
  message: t`Field option not found`,
  userFriendlyMessage: msg`Field option not found`,
});

@Injectable()
export class FlatFieldMetadataOptionValidatorService {
  private collectOptionErrors({
    universalFlatFieldMetadataOption,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatFieldMetadataMaps,
      flatFieldMetadataOptionMaps,
    },
    buildOptions,
  }: {
    universalFlatFieldMetadataOption: UniversalFlatFieldMetadataOption;
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: FieldMetadataOptionRelatedMaps;
    buildOptions: WorkspaceMigrationValidationBuildOptions;
  }): FlatEntityValidationError[] {
    const { fieldMetadataUniversalIdentifier, value, label } =
      universalFlatFieldMetadataOption;

    const flatFieldMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier: fieldMetadataUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(flatFieldMetadata)) {
      return [
        {
          code: FieldMetadataOptionExceptionCode.INVALID_FIELD_METADATA_OPTION_INPUT,
          message: t`Field option field not found`,
          userFriendlyMessage: msg`Field option field not found`,
        },
      ];
    }

    if (!isEnumUniversalFlatFieldMetadata(flatFieldMetadata)) {
      return [
        {
          code: FieldMetadataOptionExceptionCode.INVALID_FIELD_METADATA_OPTION_INPUT,
          message: t`Options can only belong to select, multi-select or rating fields`,
          userFriendlyMessage: msg`Options can only belong to select, multi-select or rating fields`,
        },
      ];
    }

    const authorContext = {
      workspaceCustomApplicationUniversalIdentifier:
        buildOptions.workspaceCustomApplicationUniversalIdentifier,
    };
    const effectiveLabel = resolveEffectiveFlatEntityProperty({
      metadataName: 'fieldMetadataOption',
      flatEntity: universalFlatFieldMetadataOption,
      property: 'label',
      authorContext,
    });
    const effectiveColor = resolveEffectiveFlatEntityProperty({
      metadataName: 'fieldMetadataOption',
      flatEntity: universalFlatFieldMetadataOption,
      property: 'color',
      authorContext,
    });

    const errors: FlatEntityValidationError[] = [
      ...validateMetadataOptionValue(value),
      ...validateMetadataOptionLabel(label),
      ...validateMetadataOptionColor(universalFlatFieldMetadataOption),
      ...(effectiveLabel !== label
        ? validateMetadataOptionLabel(effectiveLabel)
        : []),
      ...(effectiveColor !== universalFlatFieldMetadataOption.color
        ? validateMetadataOptionColor({
            label: effectiveLabel,
            color: effectiveColor,
          })
        : []),
    ];

    const hasDuplicateValue = Object.values(
      flatFieldMetadataOptionMaps.byUniversalIdentifier,
    ).some(
      (otherFlatFieldMetadataOption) =>
        isDefined(otherFlatFieldMetadataOption) &&
        otherFlatFieldMetadataOption.universalIdentifier !==
          universalFlatFieldMetadataOption.universalIdentifier &&
        otherFlatFieldMetadataOption.fieldMetadataUniversalIdentifier ===
          fieldMetadataUniversalIdentifier &&
        otherFlatFieldMetadataOption.value === value,
    );

    if (hasDuplicateValue) {
      errors.push({
        code: FieldMetadataOptionExceptionCode.INVALID_FIELD_METADATA_OPTION_INPUT,
        message: t`Option value "${value}" already exists on this field`,
        userFriendlyMessage: msg`Option value "${value}" already exists on this field`,
        value,
      });
    }

    return errors;
  }

  public validateFlatFieldMetadataOptionCreation({
    flatEntityToValidate: universalFlatFieldMetadataOption,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
    buildOptions,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.fieldMetadataOption
  >): FailedFlatEntityValidation<'fieldMetadataOption', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier:
          universalFlatFieldMetadataOption.universalIdentifier,
      },
      metadataName: 'fieldMetadataOption',
      type: 'create',
    });

    validationResult.errors.push(
      ...this.collectOptionErrors({
        universalFlatFieldMetadataOption,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        buildOptions,
      }),
    );

    return validationResult;
  }

  public validateFlatFieldMetadataOptionDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatFieldMetadataOptionMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.fieldMetadataOption
  >): FailedFlatEntityValidation<'fieldMetadataOption', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
      },
      metadataName: 'fieldMetadataOption',
      type: 'delete',
    });

    const existingFlatFieldMetadataOption = findFlatEntityByUniversalIdentifier(
      {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        flatEntityMaps: flatFieldMetadataOptionMaps,
      },
    );

    if (!isDefined(existingFlatFieldMetadataOption)) {
      validationResult.errors.push(buildNotFoundError());
    }

    return validationResult;
  }

  public validateFlatFieldMetadataOptionUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
    buildOptions,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.fieldMetadataOption
  >): FailedFlatEntityValidation<'fieldMetadataOption', 'update'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'fieldMetadataOption',
      type: 'update',
    });

    const existingFlatFieldMetadataOption = findFlatEntityByUniversalIdentifier(
      {
        universalIdentifier,
        flatEntityMaps:
          optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatFieldMetadataOptionMaps,
      },
    );

    if (!isDefined(existingFlatFieldMetadataOption)) {
      validationResult.errors.push(buildNotFoundError());

      return validationResult;
    }

    validationResult.errors.push(
      ...this.collectOptionErrors({
        universalFlatFieldMetadataOption: {
          ...existingFlatFieldMetadataOption,
          ...flatEntityUpdate,
        },
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        buildOptions,
      }),
    );

    return validationResult;
  }
}
