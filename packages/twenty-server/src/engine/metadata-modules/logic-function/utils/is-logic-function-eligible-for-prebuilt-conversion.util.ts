import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { isPackagedApplicationSource } from 'src/engine/core-modules/application/application-registration/utils/is-packaged-application-source.util';
import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export type LogicFunctionPrebuiltConversionFields = Pick<
  FlatLogicFunction,
  'executionMode' | 'isBuildUpToDate' | 'checksum' | 'deletedAt'
>;

export const isLogicFunctionEligibleForPrebuiltConversion = ({
  flatLogicFunction,
  applicationSourceType,
}: {
  flatLogicFunction: LogicFunctionPrebuiltConversionFields;
  applicationSourceType: ApplicationRegistrationSourceType;
}): boolean =>
  !isDefined(flatLogicFunction.deletedAt) &&
  flatLogicFunction.executionMode === LogicFunctionExecutionMode.LIVE &&
  isPackagedApplicationSource(applicationSourceType) &&
  flatLogicFunction.isBuildUpToDate &&
  isNonEmptyString(flatLogicFunction.checksum);
