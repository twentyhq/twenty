import { type StepDebitResult } from 'src/engine/metadata-modules/ai/ai-billing/types/step-debit-result.type';

export const findUserCreditsSpillNoticeRenewsAt = ({
  stepDebit,
  hadUserCreditsAtTurnStart,
}: {
  stepDebit: Pick<
    StepDebitResult,
    'stopReason' | 'userAllowanceExhaustedUntil'
  >;
  hadUserCreditsAtTurnStart: boolean;
}): Date | null => {
  if (!hadUserCreditsAtTurnStart || stepDebit.stopReason === 'userAllowance') {
    return null;
  }

  return stepDebit.userAllowanceExhaustedUntil;
};
