import { MemberCreditsFallback } from 'src/engine/core-modules/billing/enums/billing-member-credits-fallback.enum';
import { buildAiChatMemberCredits } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-ai-chat-member-credits.util';

const SLICE_END = new Date('2026-11-01T00:00:00.000Z');

const memberAllowanceUsage = {
  limitValue: 3_000_000,
  consumedValue: 1_000_000,
  periodEnd: SLICE_END,
  fallback: 'WORKSPACE_CREDITS' as const,
};

describe('buildAiChatMemberCredits', () => {
  it('gives nothing when member credits are off for the workspace', () => {
    expect(buildAiChatMemberCredits(null)).toBeNull();
  });

  it('keeps a member below M on their own credits', () => {
    expect(buildAiChatMemberCredits(memberAllowanceUsage)).toEqual({
      limitValue: 3_000_000,
      consumedValue: 1_000_000,
      periodEnd: SLICE_END,
      fallback: MemberCreditsFallback.WORKSPACE_CREDITS,
      isUsingWorkspaceCredits: false,
    });
  });

  it('moves a member at M onto workspace credits in spill mode', () => {
    expect(
      buildAiChatMemberCredits({
        ...memberAllowanceUsage,
        consumedValue: 3_000_000,
      }),
    ).toMatchObject({ isUsingWorkspaceCredits: true });
  });

  it('never moves a stopped member onto workspace credits', () => {
    expect(
      buildAiChatMemberCredits({
        ...memberAllowanceUsage,
        consumedValue: 3_000_000,
        fallback: 'STOP',
      }),
    ).toMatchObject({
      fallback: MemberCreditsFallback.STOP,
      isUsingWorkspaceCredits: false,
    });
  });

  it('does not claim workspace credits while the member counter is unreadable', () => {
    expect(
      buildAiChatMemberCredits({
        ...memberAllowanceUsage,
        consumedValue: null,
      }),
    ).toMatchObject({ consumedValue: null, isUsingWorkspaceCredits: false });
  });
});
