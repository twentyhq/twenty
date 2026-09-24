import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type UsageLimits } from 'src/engine/core-modules/usage-limit/types/usage-limits.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { findAiChatCreditLimits } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-ai-chat-credit-limits.util';

const buildLimit = (
  overrides: Partial<FlatUsageLimit> = {},
): FlatUsageLimit => ({
  id: 'limit-1',
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  spenderType: 'userWorkspace',
  spenderId: 'member-1',
  limitKind: 'quota',
  periodCount: 1,
  periodUnit: 'month',
  meter: 'creditsUsedMicro',
  limitValue: 1000,
  burstValue: null,
  isInstanceOverride: false,
  ...overrides,
});

const buildUsageLimits = (limits: FlatUsageLimit[]): UsageLimits =>
  limits.reduce<UsageLimits>(
    (usageLimits, limit) => {
      usageLimits.byResourceType[limit.resourceType] = [
        ...(usageLimits.byResourceType[limit.resourceType] ?? []),
        limit,
      ];

      return usageLimits;
    },
    { byResourceType: {} },
  );

const findLimits = (limits: FlatUsageLimit[]) =>
  findAiChatCreditLimits({
    usageLimits: buildUsageLimits(limits),
    userWorkspaceId: 'member-1',
  });

describe('findAiChatCreditLimits', () => {
  it('keeps the credit quota of the current member', () => {
    expect(findLimits([buildLimit()])).toEqual([buildLimit()]);
  });

  it('keeps the member pool and limits covering all operations', () => {
    const memberPool = buildLimit({
      spenderId: '',
      operationType: UsageOperationType.ALL,
    });

    expect(findLimits([memberPool])).toEqual([memberPool]);
  });

  it.each<[string, Partial<FlatUsageLimit>]>([
    ['another member', { spenderId: 'other-member' }],
    ['another resource', { resourceType: UsageResourceType.WORKFLOW }],
    [
      'another operation',
      { operationType: UsageOperationType.AI_WORKFLOW_TOKEN },
    ],
    ['another meter', { meter: 'quantity' }],
    ['a speed limit', { limitKind: 'speed' }],
  ])('ignores %s', (_, overrides) => {
    expect(findLimits([buildLimit(overrides)])).toEqual([]);
  });

  it('returns nothing when the workspace has no AI limits', () => {
    expect(findLimits([])).toEqual([]);
  });
});
