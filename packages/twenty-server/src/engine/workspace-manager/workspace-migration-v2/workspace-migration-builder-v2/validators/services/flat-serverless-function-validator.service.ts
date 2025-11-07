import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ServerlessFunctionExceptionCode } from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';
import { FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
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
  >): FailedFlatEntityValidation<FlatServerlessFunction> {
    const validationResult: FailedFlatEntityValidation<FlatServerlessFunction> =
      {
        type: 'update_serverless_function',
        errors: [],
        flatEntityMinimalInformation: {
          id: flatEntityId,
        },
      };

    const existingFlatServerlessFunction =
      optimisticFlatServerlessFunctionMaps.byId[flatEntityId];

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
    flatEntityToValidate: { id: serverlessFunctionIdToDelete },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatServerlessFunctionMaps: optimisticFlatServerlessFunctionMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.serverlessFunction
  >): FailedFlatEntityValidation<FlatServerlessFunction> {
    const validationResult: FailedFlatEntityValidation<FlatServerlessFunction> =
      {
        type: 'delete_serverless_function',
        errors: [],
        flatEntityMinimalInformation: {
          id: serverlessFunctionIdToDelete,
        },
      };

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

  public async validateFlatServerlessFunctionCreation({
    flatEntityToValidate: flatServerlessFunctionToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatServerlessFunctionMaps: optimisticFlatServerlessFunctionMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.serverlessFunction
  >): Promise<FailedFlatEntityValidation<FlatServerlessFunction>> {
    const validationResult: FailedFlatEntityValidation<FlatServerlessFunction> =
      {
        type: 'create_serverless_function',
        errors: [],
        flatEntityMinimalInformation: {
          id: flatServerlessFunctionToValidate.id,
        },
      };

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
