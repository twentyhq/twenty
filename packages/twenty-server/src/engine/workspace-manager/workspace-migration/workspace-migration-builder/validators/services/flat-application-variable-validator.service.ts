import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationVariableEntityExceptionCode } from 'src/engine/core-modules/application/application-variable/application-variable.exception';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

@Injectable()
export class FlatApplicationVariableValidatorService {
  public validateFlatApplicationVariableCreation({
    flatEntityToValidate: flatApplicationVariable,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatApplicationVariableMaps: optimisticFlatApplicationVariableMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.applicationVariable
  >): FailedFlatEntityValidation<'applicationVariable', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatApplicationVariable.universalIdentifier,
        key: flatApplicationVariable.key,
      },
      metadataName: 'applicationVariable',
      type: 'create',
    });

    if (!isNonEmptyString(flatApplicationVariable.key)) {
      validationResult.errors.push({
        code: ApplicationVariableEntityExceptionCode.INVALID_APPLICATION_VARIABLE_INPUT,
        message: t`Application variable key is required`,
        userFriendlyMessage: msg`Application variable key is required`,
      });
    }

    const existingVariableWithSameKey = Object.values(
      optimisticFlatApplicationVariableMaps.byUniversalIdentifier,
    ).find(
      (variable) =>
        isDefined(variable) &&
        variable.key === flatApplicationVariable.key &&
        variable.universalIdentifier !==
          flatApplicationVariable.universalIdentifier,
    );

    if (isDefined(existingVariableWithSameKey)) {
      validationResult.errors.push({
        code: ApplicationVariableEntityExceptionCode.INVALID_APPLICATION_VARIABLE_INPUT,
        message: t`Application variable key must be unique`,
        userFriendlyMessage: msg`Application variable key must be unique`,
      });
    }

    return validationResult;
  }

  public validateFlatApplicationVariableDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatApplicationVariableMaps: optimisticFlatApplicationVariableMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.applicationVariable
  >): FailedFlatEntityValidation<'applicationVariable', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        key: flatEntityToValidate.key,
      },
      metadataName: 'applicationVariable',
      type: 'delete',
    });

    const existingVariable = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatApplicationVariableMaps,
    });

    if (!isDefined(existingVariable)) {
      validationResult.errors.push({
        code: ApplicationVariableEntityExceptionCode.APPLICATION_VARIABLE_NOT_FOUND,
        message: t`Application variable not found`,
        userFriendlyMessage: msg`Application variable not found`,
      });
    }

    return validationResult;
  }

  public validateFlatApplicationVariableUpdate({
    universalIdentifier,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatApplicationVariableMaps: optimisticFlatApplicationVariableMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.applicationVariable
  >): FailedFlatEntityValidation<'applicationVariable', 'update'> {
    const fromFlatApplicationVariable = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatApplicationVariableMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'applicationVariable',
      type: 'update',
    });

    if (!isDefined(fromFlatApplicationVariable)) {
      validationResult.errors.push({
        code: ApplicationVariableEntityExceptionCode.APPLICATION_VARIABLE_NOT_FOUND,
        message: t`Application variable not found`,
        userFriendlyMessage: msg`Application variable not found`,
      });
    }

    return validationResult;
  }
}
