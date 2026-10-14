import { UserCreditsFallback } from 'src/engine/core-modules/billing/enums/billing-user-credits-fallback.enum';
import { buildAiChatUserCredits } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-ai-chat-user-credits.util';

const SLICE_END = new Date('2026-11-01T00:00:00.000Z');

const userAllowanceUsage = {
  limitValue: 3_000_000,
  consumedValue: 1_000_000,
  periodEnd: SLICE_END,
  fallback: 'WORKSPACE_CREDITS' as const,
};

describe('buildAiChatUserCredits', () => {
  it('gives nothing when user credits are off for the workspace', () => {
    expect(buildAiChatUserCredits(null)).toBeNull();
  });

  it('keeps a member below M on their own credits', () => {
    expect(buildAiChatUserCredits(userAllowanceUsage)).toEqual({
      limitValue: 3_000_000,
      consumedValue: 1_000_000,
      periodEnd: SLICE_END,
      fallback: UserCreditsFallback.WORKSPACE_CREDITS,
      isUsingWorkspaceCredits: false,
    });
  });

  it('moves a member at M onto workspace credits in spill mode', () => {
    expect(
      buildAiChatUserCredits({
        ...userAllowanceUsage,
        consumedValue: 3_000_000,
      }),
    ).toMatchObject({ isUsingWorkspaceCredits: true });
  });

  it('never moves a stopped member onto workspace credits', () => {
    expect(
      buildAiChatUserCredits({
        ...userAllowanceUsage,
        consumedValue: 3_000_000,
        fallback: 'STOP',
      }),
    ).toMatchObject({
      fallback: UserCreditsFallback.STOP,
      isUsingWorkspaceCredits: false,
    });
  });

  it('does not claim workspace credits while the user allowance counter is unreadable', () => {
    expect(
      buildAiChatUserCredits({
        ...userAllowanceUsage,
        consumedValue: null,
      }),
    ).toMatchObject({ consumedValue: null, isUsingWorkspaceCredits: false });
  });
});
