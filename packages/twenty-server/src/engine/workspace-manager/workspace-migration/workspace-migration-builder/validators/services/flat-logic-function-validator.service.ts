import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-args.type';

@Injectable()
export class FlatLogicFunctionValidatorService {
  constructor() {}

  public validateFlatLogicFunctionUpdate({
    flatEntityId,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatLogicFunctionMaps: optimisticFlatLogicFunctionMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.logicFunction
  >): FailedFlatEntityValidation<'logicFunction', 'update'> {
    const existingFlatLogicFunction =
      optimisticFlatLogicFunctionMaps.byId[flatEntityId];

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityId,
        universalIdentifier: existingFlatLogicFunction?.universalIdentifier,
      },
      metadataName: 'logicFunction',
      type: 'update',
    });

    if (!isDefined(existingFlatLogicFunction)) {
      validationResult.errors.push({
        code: LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
        message: t`Logic function not found`,
        userFriendlyMessage: msg`Logic function not found`,
      });
    }

    return validationResult;
  }

  public validateFlatLogicFunctionDeletion({
    flatEntityToValidate: { id: logicFunctionIdToDelete, universalIdentifier },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatLogicFunctionMaps: optimisticFlatLogicFunctionMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.logicFunction
  >): FailedFlatEntityValidation<'logicFunction', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: logicFunctionIdToDelete,
        universalIdentifier,
      },
      metadataName: 'logicFunction',
      type: 'delete',
    });

    const existingFlatLogicFunction =
      optimisticFlatLogicFunctionMaps.byId[logicFunctionIdToDelete];

    if (!isDefined(existingFlatLogicFunction)) {
      validationResult.errors.push({
        code: LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
        message: t`Logic function not found`,
        userFriendlyMessage: msg`Logic function not found`,
      });
    }

    return validationResult;
  }

  public validateFlatLogicFunctionCreation({
    flatEntityToValidate: flatLogicFunctionToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatLogicFunctionMaps: optimisticFlatLogicFunctionMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.logicFunction
  >): FailedFlatEntityValidation<'logicFunction', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatLogicFunctionToValidate.id,
        universalIdentifier: flatLogicFunctionToValidate.universalIdentifier,
      },
      metadataName: 'logicFunction',
      type: 'create',
    });

    if (
      isDefined(
        optimisticFlatLogicFunctionMaps.byId[flatLogicFunctionToValidate.id],
      )
    ) {
      validationResult.errors.push({
        code: LogicFunctionExceptionCode.LOGIC_FUNCTION_ALREADY_EXIST,
        message: t`Logic function with same id already exists`,
        userFriendlyMessage: msg`Logic function already exists`,
      });
    }

    return validationResult;
  }
}
