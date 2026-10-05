import { isPlainObject } from '@/utils/typeguard/isPlainObject';

import {
  PAUSING_TOOL_CALL_STATUSES,
  type PausingToolCallStatus,
} from '../constants/pausing-tool-call-statuses.const';

export const readPausingToolCallStatus = (
  toolOutput: unknown,
): PausingToolCallStatus | undefined => {
  const status =
    isPlainObject(toolOutput) && isPlainObject(toolOutput.result)
      ? toolOutput.result.status
      : undefined;

  return (PAUSING_TOOL_CALL_STATUSES as readonly unknown[]).includes(status)
    ? (status as PausingToolCallStatus)
    : undefined;
};
