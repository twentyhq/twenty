import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type SetuAiErrorCode } from 'twenty-shared/ai';

import { CustomException } from 'src/utils/custom-exception';

// Messages never name records, so an error cannot disclose what the caller
// is not allowed to see.
const getSetuAiTaskUserFriendlyMessage = (
  code: SetuAiErrorCode,
): MessageDescriptor => {
  switch (code) {
    case 'INVALID_INPUT':
      return msg`Some details are not valid.`;
    case 'STALE_VERSION':
      return msg`This task changed since you opened it. Review the latest state.`;
    case 'NOT_REVIEWABLE':
      return msg`This part of the task can no longer be changed.`;
    case 'BUDGET_EXHAUSTED':
      return msg`The AI budget for this work is used up.`;
    case 'MODEL_UNAVAILABLE':
      return msg`Research needs an OpenAI model, and none is available.`;
    case 'UNSUPPORTED_ACTION':
      return msg`This request is not supported.`;
    default:
      return msg`This task is not available.`;
  }
};

export class SetuAiTaskException extends CustomException<SetuAiErrorCode> {
  constructor(message: string, code: SetuAiErrorCode) {
    super(message, code, {
      userFriendlyMessage: getSetuAiTaskUserFriendlyMessage(code),
    });
  }
}
