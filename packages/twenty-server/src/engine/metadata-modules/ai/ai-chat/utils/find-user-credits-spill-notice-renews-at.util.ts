import { isDefined } from 'twenty-shared/utils';

import { type StepDebitResult } from 'src/engine/metadata-modules/ai/ai-billing/types/step-debit-result.type';

export const findUserCreditsSpillNoticeRenewsAt = ({
  stepDebit,
  isUserAllowanceAvailableAtAdmission,
}: {
  stepDebit: Pick<
    StepDebitResult,
    'stopReason' | 'isUserAllowanceExhausted' | 'userAllowancePeriodEnd'
  >;
  isUserAllowanceAvailableAtAdmission: boolean | null;
}): Date | null => {
  if (
    isUserAllowanceAvailableAtAdmission !== true ||
    !stepDebit.isUserAllowanceExhausted ||
    stepDebit.stopReason === 'userAllowance'
  ) {
    return null;
  }

  return isDefined(stepDebit.userAllowancePeriodEnd)
    ? stepDebit.userAllowancePeriodEnd
    : null;
};
