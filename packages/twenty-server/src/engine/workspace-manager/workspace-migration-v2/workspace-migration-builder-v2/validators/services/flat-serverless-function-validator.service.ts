import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ServerlessFunctionExceptionCode } from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';

@Injectable()
export class FlatServerlessFunctionValidatorService {
  constructor() {}

  public validateFlatServerlessFunctionUpdate({
    flatEntityId,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatServerlessFunctionMaps: optimisticFlatServerlessFunctionMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.serverlessFunction
  >): FailedFlatEntityValidation<'serverlessFunction', 'update'> {
    const existingFlatServerlessFunction =
      optimisticFlatServerlessFunctionMaps.byId[flatEntityId];

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityId,
        universalIdentifier:
          existingFlatServerlessFunction?.universalIdentifier,
      },
      metadataName: 'serverlessFunction',
      type: 'update',
    });

    if (!isDefined(existingFlatServerlessFunction)) {
      validationResult.errors.push({
        code: ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
        message: t`Serverless function not found`,
        userFriendlyMessage: msg`Serverless function not found`,
      });
    }

    return validationResult;
  }

  public validateFlatServerlessFunctionDeletion({
    flatEntityToValidate: {
      id: serverlessFunctionIdToDelete,
      universalIdentifier,
    },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatServerlessFunctionMaps: optimisticFlatServerlessFunctionMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.serverlessFunction
  >): FailedFlatEntityValidation<'serverlessFunction', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: serverlessFunctionIdToDelete,
        universalIdentifier,
      },
      metadataName: 'serverlessFunction',
      type: 'delete',
    });

    const existingFlatServerlessFunction =
      optimisticFlatServerlessFunctionMaps.byId[serverlessFunctionIdToDelete];

    if (!isDefined(existingFlatServerlessFunction)) {
      validationResult.errors.push({
        code: ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
        message: t`Serverless function not found`,
        userFriendlyMessage: msg`Serverless function not found`,
      });
    }

    return validationResult;
  }

  public validateFlatServerlessFunctionCreation({
    flatEntityToValidate: flatServerlessFunctionToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatServerlessFunctionMaps: optimisticFlatServerlessFunctionMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.serverlessFunction
  >): FailedFlatEntityValidation<'serverlessFunction', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatServerlessFunctionToValidate.id,
        universalIdentifier:
          flatServerlessFunctionToValidate.universalIdentifier,
      },
      metadataName: 'serverlessFunction',
      type: 'create',
    });

    if (
      isDefined(
        optimisticFlatServerlessFunctionMaps.byId[
          flatServerlessFunctionToValidate.id
        ],
      )
    ) {
      validationResult.errors.push({
        code: ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_ALREADY_EXIST,
        message: t`Serverless function with same id already exists`,
        userFriendlyMessage: msg`Serverless function already exists`,
      });
    }

    return validationResult;
  }
}
