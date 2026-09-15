import { Test } from '@nestjs/testing';

import { AiChatUsageService } from 'src/engine/metadata-modules/ai/ai-chat/services/ai-chat-usage.service';
import { UsageLimitEntitlementService } from 'src/engine/core-modules/usage-limit/services/usage-limit-entitlement.service';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

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
  ...overrides,
});

const periodEnd = new Date('2026-10-01T00:00:00Z');
const allowance = { limitValue: 10000, consumedValue: 500, periodEnd };

describe('AiChatUsageService', () => {
  let service: AiChatUsageService;
  const findAll = jest.fn();
  const findEnforceableLimits = jest.fn();
  const readLimitConsumptions = jest.fn();
  const getAllowanceUsage = jest.fn();
  const findUsage = () =>
    service.findUsage({
      workspaceId: 'workspace-1',
      userWorkspaceId: 'member-1',
    });

  beforeEach(async () => {
    jest.resetAllMocks();
    findAll.mockResolvedValue([]);
    findEnforceableLimits.mockImplementation(
      async ({ limits }: { limits: FlatUsageLimit[] }) => limits,
    );
    readLimitConsumptions.mockResolvedValue(
      new Map([['limit-1', { consumedValue: 200, periodEnd }]]),
    );
    getAllowanceUsage.mockResolvedValue(allowance);
    const module = await Test.createTestingModule({
      providers: [
        AiChatUsageService,
        {
          provide: WorkspaceCacheService,
          useValue: {
            getOrRecompute: async () => ({
              usageLimits: {
                byResourceType: { [UsageResourceType.AI]: await findAll() },
              },
            }),
          },
        },
        {
          provide: UsageLimitEntitlementService,
          useValue: { findEnforceableLimits },
        },
        {
          provide: UsageLimitQuotaService,
          useValue: { readLimitConsumptions, getAllowanceUsage },
        },
      ],
    }).compile();
    service = module.get(AiChatUsageService);
  });

  it('returns the workspace allowance when no member limit applies', async () => {
    await expect(findUsage()).resolves.toEqual(allowance);
  });

  it('uses the current member limit instead of the workspace allowance', async () => {
    findAll.mockResolvedValue([buildLimit()]);
    await expect(findUsage()).resolves.toEqual({
      limitValue: 1000,
      consumedValue: 200,
      periodEnd,
    });
    expect(getAllowanceUsage).not.toHaveBeenCalled();
  });

  it('ignores other members, unrelated resources, operations and meters', async () => {
    findAll.mockResolvedValue([
      buildLimit({ spenderId: 'other-member' }),
      buildLimit({ resourceType: UsageResourceType.WORKFLOW }),
      buildLimit({ operationType: UsageOperationType.AI_WORKFLOW_TOKEN }),
      buildLimit({ meter: 'quantity' }),
      buildLimit({ limitKind: 'speed' }),
    ]);
    await expect(findUsage()).resolves.toEqual(allowance);
    expect(readLimitConsumptions).not.toHaveBeenCalled();
  });

  it('includes the member pool and all AI operations', async () => {
    findAll.mockResolvedValue([
      buildLimit({ spenderId: '', operationType: UsageOperationType.ALL }),
    ]);
    await expect(findUsage()).resolves.toEqual({
      limitValue: 1000,
      consumedValue: 200,
      periodEnd,
    });
  });

  it('falls back to the workspace allowance for unenforced member limits', async () => {
    findAll.mockResolvedValue([buildLimit()]);
    findEnforceableLimits.mockResolvedValue([]);
    await expect(findUsage()).resolves.toEqual(allowance);
  });

  it('does not replace missing member consumption with workspace consumption', async () => {
    findAll.mockResolvedValue([buildLimit()]);
    readLimitConsumptions.mockResolvedValue(new Map());
    await expect(findUsage()).resolves.toEqual({
      limitValue: 1000,
      consumedValue: null,
      periodEnd: null,
    });
  });

  it('shows the closest to exhaustion when several periods apply', async () => {
    findAll.mockResolvedValue([
      buildLimit(),
      buildLimit({ id: 'daily', periodUnit: 'day', limitValue: 100 }),
    ]);
    readLimitConsumptions.mockResolvedValue(
      new Map([
        ['limit-1', { consumedValue: 200, periodEnd }],
        ['daily', { consumedValue: 90, periodEnd }],
      ]),
    );
    await expect(findUsage()).resolves.toEqual({
      limitValue: 100,
      consumedValue: 90,
      periodEnd,
    });
  });

  it('preserves an unknown counter when another applicable counter is warm', async () => {
    findAll.mockResolvedValue([
      buildLimit(),
      buildLimit({ id: 'cold', periodUnit: 'day', limitValue: 100 }),
    ]);
    await expect(findUsage()).resolves.toEqual({
      limitValue: 100,
      consumedValue: null,
      periodEnd: null,
    });
  });

  it('keeps a zero credit limit as an exhausted limit', async () => {
    findAll.mockResolvedValue([buildLimit({ limitValue: 0 })]);
    await expect(findUsage()).resolves.toMatchObject({ limitValue: 0 });
  });
});
