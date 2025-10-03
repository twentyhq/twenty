import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { ServerlessFunctionExceptionCode } from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';
import { FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

type ServerlessFunctionValidationArgs = {
  flatServerlessFunctionToValidate: FlatServerlessFunction;
  optimisticFlatServerlessFunctionMaps: FlatEntityMaps<FlatServerlessFunction>;
};
@Injectable()
export class FlatServerlessFunctionValidatorService {
  constructor() {}

  public validateFlatServerlessFunctionUpdate({
    flatServerlessFunctionToValidate: updatedFlatServerlessFunction,
    optimisticFlatServerlessFunctionMaps,
  }: ServerlessFunctionValidationArgs): FailedFlatEntityValidation<FlatServerlessFunction> {
    const errors = [];

    const existingFlatServerlessFunction =
      optimisticFlatServerlessFunctionMaps.byId[
        updatedFlatServerlessFunction.id
      ];

    if (!isDefined(existingFlatServerlessFunction)) {
      errors.push({
        code: ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
        message: t`Serverless function not found`,
        userFriendlyMessage: t`Serverless function not found`,
      });
    }

    return {
      type: 'update_serverless_function',
      errors,
      flatEntityMinimalInformation: {
        id: updatedFlatServerlessFunction.id,
      },
    };
  }

  public validateFlatServerlessFunctionDeletion({
    flatServerlessFunctionToValidate: { id: serverlessFunctionIdToDelete },
    optimisticFlatServerlessFunctionMaps,
  }: ServerlessFunctionValidationArgs): FailedFlatEntityValidation<FlatServerlessFunction> {
    const errors = [];

    const existingFlatServerlessFunction =
      optimisticFlatServerlessFunctionMaps.byId[serverlessFunctionIdToDelete];

    if (!isDefined(existingFlatServerlessFunction)) {
      errors.push({
        code: ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
        message: t`Serverless function not found`,
        userFriendlyMessage: t`Serverless function not found`,
      });
    }

    return {
      type: 'delete_serverless_function',
      errors,
      flatEntityMinimalInformation: {
        id: serverlessFunctionIdToDelete,
      },
    };
  }

  public async validateFlatServerlessFunctionCreation({
    flatServerlessFunctionToValidate,
    optimisticFlatServerlessFunctionMaps,
  }: ServerlessFunctionValidationArgs): Promise<
    FailedFlatEntityValidation<FlatServerlessFunction>
  > {
    const errors = [];

    if (
      isDefined(
        optimisticFlatServerlessFunctionMaps.byId[
          flatServerlessFunctionToValidate.id
        ],
      )
    ) {
      errors.push({
        code: ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_ALREADY_EXIST,
        message: t`Serverless function with same id already exists`,
        userFriendlyMessage: t`Serverless function already exists`,
      });
    }

    return {
      type: 'create_serverless_function',
      errors,
      flatEntityMinimalInformation: {
        id: flatServerlessFunctionToValidate.id,
      },
    };
  }
}
