import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { validateFilePath } from 'src/engine/core-modules/file-storage/utils/validate-file-path.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { isLogicFunctionReadyForPrebuiltInstall } from 'src/engine/metadata-modules/logic-function/utils/is-logic-function-ready-for-prebuilt-install.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

@Injectable()
export class FlatLogicFunctionValidatorService {
  constructor() {}

  public validateFlatLogicFunctionUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatLogicFunctionMaps: optimisticFlatLogicFunctionMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.logicFunction
  >): FailedFlatEntityValidation<'logicFunction', 'update'> {
    const existingFlatLogicFunction = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatLogicFunctionMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
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

      return validationResult;
    }

    if (isDefined(flatEntityUpdate.builtHandlerPath)) {
      const builtPathResult = validateFilePath({
        resourcePath: flatEntityUpdate.builtHandlerPath,
        fileFolder: FileFolder.BuiltLogicFunction,
      });

      if (!builtPathResult.isValid) {
        validationResult.errors.push({
          code: LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
          message: builtPathResult.error,
          userFriendlyMessage: msg`Built handler path is invalid`,
        });
      }
    }

    if (isDefined(flatEntityUpdate.sourceHandlerPath)) {
      const sourcePathResult = validateFilePath({
        resourcePath: flatEntityUpdate.sourceHandlerPath,
        fileFolder: FileFolder.Source,
      });

      if (!sourcePathResult.isValid) {
        validationResult.errors.push({
          code: LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
          message: sourcePathResult.error,
          userFriendlyMessage: msg`Source handler path is invalid`,
        });
      }
    }

    const mergedPrebuiltState = {
      executionMode:
        flatEntityUpdate.executionMode ??
        existingFlatLogicFunction.executionMode,
      buildStatus:
        flatEntityUpdate.buildStatus ?? existingFlatLogicFunction.buildStatus,
      checksum:
        flatEntityUpdate.checksum !== undefined
          ? flatEntityUpdate.checksum
          : existingFlatLogicFunction.checksum,
    };

    if (
      mergedPrebuiltState.executionMode ===
        LogicFunctionExecutionMode.PREBUILT &&
      !isLogicFunctionReadyForPrebuiltInstall(mergedPrebuiltState)
    ) {
      validationResult.errors.push({
        code: LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
        message: t`Logic function cannot be in PREBUILT mode without a fresh build and a checksum`,
        userFriendlyMessage: msg`Logic function cannot be in PREBUILT mode without a fresh build and a checksum`,
      });
    }

    return validationResult;
  }

  public validateFlatLogicFunctionDeletion({
    flatEntityToValidate: { universalIdentifier },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatLogicFunctionMaps: optimisticFlatLogicFunctionMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.logicFunction
  >): FailedFlatEntityValidation<'logicFunction', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'logicFunction',
      type: 'delete',
    });

    const existingFlatLogicFunction = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatLogicFunctionMaps,
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

  public validateFlatLogicFunctionCreation({
    flatEntityToValidate: flatLogicFunctionToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatLogicFunctionMaps: optimisticFlatLogicFunctionMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.logicFunction
  >): FailedFlatEntityValidation<'logicFunction', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatLogicFunctionToValidate.universalIdentifier,
      },
      metadataName: 'logicFunction',
      type: 'create',
    });

    if (
      isDefined(
        findFlatEntityByUniversalIdentifier({
          universalIdentifier: flatLogicFunctionToValidate.universalIdentifier,
          flatEntityMaps: optimisticFlatLogicFunctionMaps,
        }),
      )
    ) {
      validationResult.errors.push({
        code: LogicFunctionExceptionCode.LOGIC_FUNCTION_ALREADY_EXIST,
        message: t`Logic function with same universal identifier already exists`,
        userFriendlyMessage: msg`Logic function already exists`,
      });
    }

    if (isDefined(flatLogicFunctionToValidate.builtHandlerPath)) {
      const builtPathResult = validateFilePath({
        resourcePath: flatLogicFunctionToValidate.builtHandlerPath,
        fileFolder: FileFolder.BuiltLogicFunction,
      });

      if (!builtPathResult.isValid) {
        validationResult.errors.push({
          code: LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
          message: builtPathResult.error,
          userFriendlyMessage: msg`Built handler path is invalid`,
        });
      }
    }

    if (isDefined(flatLogicFunctionToValidate.sourceHandlerPath)) {
      const sourcePathResult = validateFilePath({
        resourcePath: flatLogicFunctionToValidate.sourceHandlerPath,
        fileFolder: FileFolder.Source,
      });

      if (!sourcePathResult.isValid) {
        validationResult.errors.push({
          code: LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
          message: sourcePathResult.error,
          userFriendlyMessage: msg`Source handler path is invalid`,
        });
      }
    }

    if (
      flatLogicFunctionToValidate.executionMode ===
        LogicFunctionExecutionMode.PREBUILT &&
      !isLogicFunctionReadyForPrebuiltInstall(flatLogicFunctionToValidate)
    ) {
      validationResult.errors.push({
        code: LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
        message: t`Logic function cannot be in PREBUILT mode without a fresh build and a checksum`,
        userFriendlyMessage: msg`Logic function cannot be in PREBUILT mode without a fresh build and a checksum`,
      });
    }

    return validationResult;
  }
}
