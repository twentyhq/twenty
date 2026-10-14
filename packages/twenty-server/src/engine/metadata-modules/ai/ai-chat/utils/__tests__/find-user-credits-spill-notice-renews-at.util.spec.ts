import { findUserCreditsSpillNoticeRenewsAt } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-user-credits-spill-notice-renews-at.util';

const SLICE_END = new Date('2026-11-01T00:00:00.000Z');

const crossingStepDebit = {
  stopReason: null,
  isUserAllowanceExhausted: true,
  userAllowancePeriodEnd: SLICE_END,
};

describe('findUserCreditsSpillNoticeRenewsAt', () => {
  it('gives the week end when a spill mode step takes a member who had credits at admission to M', () => {
    expect(
      findUserCreditsSpillNoticeRenewsAt({
        stepDebit: crossingStepDebit,
        hadUserCreditsAtTurnStart: true,
      }),
    ).toEqual(SLICE_END);
  });

  it('still gives it when the same step also exhausts the workspace allowance', () => {
    expect(
      findUserCreditsSpillNoticeRenewsAt({
        stepDebit: { ...crossingStepDebit, stopReason: 'workspaceAllowance' },
        hadUserCreditsAtTurnStart: true,
      }),
    ).toEqual(SLICE_END);
  });

  it('gives nothing for a STOP mode member stop', () => {
    expect(
      findUserCreditsSpillNoticeRenewsAt({
        stepDebit: { ...crossingStepDebit, stopReason: 'userAllowance' },
        hadUserCreditsAtTurnStart: true,
      }),
    ).toBeNull();
  });

  it('gives nothing while the user allowance counter stays below M', () => {
    expect(
      findUserCreditsSpillNoticeRenewsAt({
        stepDebit: { ...crossingStepDebit, isUserAllowanceExhausted: false },
        hadUserCreditsAtTurnStart: true,
      }),
    ).toBeNull();
  });

  it('gives nothing when the admission already saw the member at M or could not read them', () => {
    expect(
      findUserCreditsSpillNoticeRenewsAt({
        stepDebit: crossingStepDebit,
        hadUserCreditsAtTurnStart: false,
      }),
    ).toBeNull();
  });

  it('gives nothing when the debit carries no period end', () => {
    expect(
      findUserCreditsSpillNoticeRenewsAt({
        stepDebit: { ...crossingStepDebit, userAllowancePeriodEnd: null },
        hadUserCreditsAtTurnStart: true,
      }),
    ).toBeNull();
  });
});
