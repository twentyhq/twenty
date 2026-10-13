import { isDefined } from 'twenty-shared/utils';

import { type StepDebitResult } from 'src/engine/metadata-modules/ai/ai-billing/types/step-debit-result.type';

// A member stop is never a spill: STOP mode reports it as the 'memberAllowance' stop reason
export const findMemberCreditsSpillNoticeRenewsAt = ({
  stepDebit,
  isMemberAllowanceAvailableAtAdmission,
}: {
  stepDebit: Pick<
    StepDebitResult,
    'stopReason' | 'isMemberAllowanceExhausted' | 'memberAllowancePeriodEnd'
  >;
  isMemberAllowanceAvailableAtAdmission: boolean | null;
}): Date | null => {
  if (
    isMemberAllowanceAvailableAtAdmission !== true ||
    !stepDebit.isMemberAllowanceExhausted ||
    stepDebit.stopReason === 'memberAllowance'
  ) {
    return null;
  }

  return isDefined(stepDebit.memberAllowancePeriodEnd)
    ? stepDebit.memberAllowancePeriodEnd
    : null;
};
