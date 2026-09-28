import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type LimitConsumption } from 'src/engine/core-modules/usage-limit/types/limit-consumption.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { selectAiChatUsage } from 'src/engine/metadata-modules/ai/ai-chat/utils/select-ai-chat-usage.util';

const periodStart = new Date('2026-09-01T00:00:00Z');
const periodEnd = new Date('2026-10-01T00:00:00Z');

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

const buildConsumption = (consumedValue: number): LimitConsumption => ({
  consumedValue,
  remainingValue: null,
  periodStart,
  periodEnd,
});

describe('selectAiChatUsage', () => {
  it('reports the consumption of the only limit', () => {
    expect(
      selectAiChatUsage({
        limits: [buildLimit()],
        consumptionById: new Map([['limit-1', buildConsumption(200)]]),
      }),
    ).toEqual({ limitValue: 1000, consumedValue: 200, periodEnd });
  });

  it('surfaces the limit closest to exhaustion when several periods apply', () => {
    expect(
      selectAiChatUsage({
        limits: [
          buildLimit(),
          buildLimit({ id: 'daily', periodUnit: 'day', limitValue: 100 }),
        ],
        consumptionById: new Map([
          ['limit-1', buildConsumption(200)],
          ['daily', buildConsumption(90)],
        ]),
      }),
    ).toEqual({ limitValue: 100, consumedValue: 90, periodEnd });
  });

  it('treats a zero limit as the most exhausted', () => {
    expect(
      selectAiChatUsage({
        limits: [
          buildLimit({ id: 'exhausted', limitValue: 0 }),
          buildLimit({ id: 'warm', limitValue: 100 }),
        ],
        consumptionById: new Map([
          ['exhausted', buildConsumption(0)],
          ['warm', buildConsumption(90)],
        ]),
      }),
    ).toMatchObject({ limitValue: 0 });
  });

  it('reports an unreadable counter rather than a zero consumption', () => {
    expect(
      selectAiChatUsage({
        limits: [buildLimit()],
        consumptionById: new Map(),
      }),
    ).toEqual({ limitValue: 1000, consumedValue: null, periodEnd: null });
  });

  it('prefers an unreadable counter over a warm one', () => {
    expect(
      selectAiChatUsage({
        limits: [
          buildLimit({ id: 'warm' }),
          buildLimit({ id: 'cold', limitValue: 100 }),
        ],
        consumptionById: new Map([['warm', buildConsumption(200)]]),
      }),
    ).toEqual({ limitValue: 100, consumedValue: null, periodEnd: null });
  });

  it('returns nothing when no limit applies', () => {
    expect(
      selectAiChatUsage({ limits: [], consumptionById: new Map() }),
    ).toBeNull();
  });
});
