import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateIfPrebuiltIsValid = ({
  executionMode,
  isBuildUpToDate,
  checksum,
}: {
  executionMode: LogicFunctionExecutionMode | null | undefined;
  isBuildUpToDate: boolean | null | undefined;
  checksum: string | null | undefined;
}): FlatEntityValidationError | undefined => {
  const isValid =
    executionMode !== LogicFunctionExecutionMode.PREBUILT ||
    (isBuildUpToDate === true && isDefined(checksum));

  if (isValid) {
    return undefined;
  }

  return {
    code: LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
    message: t`Logic function cannot be in PREBUILT mode without a fresh build and a checksum`,
    userFriendlyMessage: msg`Logic function cannot be in PREBUILT mode without a fresh build and a checksum`,
  };
};
