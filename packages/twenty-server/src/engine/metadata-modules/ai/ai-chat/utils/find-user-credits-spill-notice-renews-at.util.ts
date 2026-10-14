import { isDefined } from 'twenty-shared/utils';

import { type StepDebitResult } from 'src/engine/metadata-modules/ai/ai-billing/types/step-debit-result.type';

export const findUserCreditsSpillNoticeRenewsAt = ({
  stepDebit,
  hadUserCreditsAtTurnStart,
}: {
  stepDebit: Pick<
    StepDebitResult,
    'stopReason' | 'isUserAllowanceExhausted' | 'userAllowancePeriodEnd'
  >;
  hadUserCreditsAtTurnStart: boolean;
}): Date | null => {
  if (
    !hadUserCreditsAtTurnStart ||
    !stepDebit.isUserAllowanceExhausted ||
    stepDebit.stopReason === 'userAllowance'
  ) {
    return null;
  }

  return isDefined(stepDebit.userAllowancePeriodEnd)
    ? stepDebit.userAllowancePeriodEnd
    : null;
};
