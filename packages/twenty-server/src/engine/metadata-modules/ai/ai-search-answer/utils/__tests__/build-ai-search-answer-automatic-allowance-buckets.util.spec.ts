import { buildAiSearchAnswerAutomaticAllowanceBuckets } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/build-ai-search-answer-automatic-allowance-buckets.util';

describe('buildAiSearchAnswerAutomaticAllowanceBuckets', () => {
  it('limits automatic answers per member and per workspace', () => {
    expect(
      buildAiSearchAnswerAutomaticAllowanceBuckets({
        workspaceId: 'workspace-id',
        userWorkspaceId: 'user-workspace-id',
        userAllowance: 30,
        workspaceAllowance: 300,
        windowMs: 3_600_000,
      }),
    ).toEqual([
      {
        key: 'ai-search-answer:automatic:workspace-id:user-workspace-id',
        burst: 30,
        refillPerWindow: 30,
        windowMs: 3_600_000,
      },
      {
        key: 'ai-search-answer:automatic:workspace-id',
        burst: 300,
        refillPerWindow: 300,
        windowMs: 3_600_000,
      },
    ]);
  });
});
