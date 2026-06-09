import {
  LogicFunctionBuildStatus,
  LogicFunctionExecutionMode,
} from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  isLogicFunctionReadyForPrebuiltInstall,
  type LogicFunctionPrebuiltStateFields,
} from 'src/engine/metadata-modules/logic-function/utils/is-logic-function-ready-for-prebuilt-install.util';

export type ResolveEffectiveExecutionModeResult =
  | { effectiveExecutionMode: LogicFunctionExecutionMode; canExecute: true }
  | { effectiveExecutionMode: null; canExecute: false };

/**
 * Resolves the execution mode actually used to invoke a logic function, given
 * the requested mode and the function's build state.
 *
 * - PREBUILT requested AND ready (built, deployed, matching checksum) -> PREBUILT
 * - buildStatus CODE_BUILT or DEPLOY_FAILED -> LIVE fallback (artifact exists,
 *   ship code on demand). Dormant in PR1: those states are never written yet.
 * - otherwise (NOT_BUILT in PREBUILT mode) -> cannot execute (caller throws)
 *
 * For LIVE requests this always returns LIVE.
 */
export const resolveEffectiveLogicFunctionExecutionMode = ({
  requestedExecutionMode,
  flatLogicFunction,
}: {
  requestedExecutionMode: LogicFunctionExecutionMode;
  flatLogicFunction: LogicFunctionPrebuiltStateFields;
}): ResolveEffectiveExecutionModeResult => {
  if (requestedExecutionMode !== LogicFunctionExecutionMode.PREBUILT) {
    return {
      effectiveExecutionMode: requestedExecutionMode,
      canExecute: true,
    };
  }

  if (isLogicFunctionReadyForPrebuiltInstall(flatLogicFunction)) {
    return {
      effectiveExecutionMode: LogicFunctionExecutionMode.PREBUILT,
      canExecute: true,
    };
  }

  if (
    flatLogicFunction.buildStatus === LogicFunctionBuildStatus.CODE_BUILT ||
    flatLogicFunction.buildStatus === LogicFunctionBuildStatus.DEPLOY_FAILED
  ) {
    return {
      effectiveExecutionMode: LogicFunctionExecutionMode.LIVE,
      canExecute: true,
    };
  }

  return {
    effectiveExecutionMode: null,
    canExecute: false,
  };
};
