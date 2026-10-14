import { findMemberCreditsSpillNoticeRenewsAt } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-member-credits-spill-notice-renews-at.util';

const SLICE_END = new Date('2026-11-01T00:00:00.000Z');

const crossingStepDebit = {
  stopReason: null,
  isMemberAllowanceExhausted: true,
  memberAllowancePeriodEnd: SLICE_END,
};

describe('findMemberCreditsSpillNoticeRenewsAt', () => {
  it('gives the week end when a spill mode step takes a member who had credits at admission to M', () => {
    expect(
      findMemberCreditsSpillNoticeRenewsAt({
        stepDebit: crossingStepDebit,
        isMemberAllowanceAvailableAtAdmission: true,
      }),
    ).toEqual(SLICE_END);
  });

  it('still gives it when the same step also exhausts the workspace allowance', () => {
    expect(
      findMemberCreditsSpillNoticeRenewsAt({
        stepDebit: { ...crossingStepDebit, stopReason: 'allowance' },
        isMemberAllowanceAvailableAtAdmission: true,
      }),
    ).toEqual(SLICE_END);
  });

  it('gives nothing for a STOP mode member stop', () => {
    expect(
      findMemberCreditsSpillNoticeRenewsAt({
        stepDebit: { ...crossingStepDebit, stopReason: 'memberAllowance' },
        isMemberAllowanceAvailableAtAdmission: true,
      }),
    ).toBeNull();
  });

  it('gives nothing while the member counter stays below M', () => {
    expect(
      findMemberCreditsSpillNoticeRenewsAt({
        stepDebit: { ...crossingStepDebit, isMemberAllowanceExhausted: false },
        isMemberAllowanceAvailableAtAdmission: true,
      }),
    ).toBeNull();
  });

  it('gives nothing when the admission already saw the member at M or could not read them', () => {
    expect(
      findMemberCreditsSpillNoticeRenewsAt({
        stepDebit: crossingStepDebit,
        isMemberAllowanceAvailableAtAdmission: false,
      }),
    ).toBeNull();
  });

  it('gives nothing when the debit carries no period end', () => {
    expect(
      findMemberCreditsSpillNoticeRenewsAt({
        stepDebit: { ...crossingStepDebit, memberAllowancePeriodEnd: null },
        isMemberAllowanceAvailableAtAdmission: true,
      }),
    ).toBeNull();
  });
});
