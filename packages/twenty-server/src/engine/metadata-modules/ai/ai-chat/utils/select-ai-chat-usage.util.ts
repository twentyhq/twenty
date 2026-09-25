import { isDefined } from 'twenty-shared/utils';

import { type AiChatUsageDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/ai-chat-usage.dto';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type LimitConsumption } from 'src/engine/core-modules/usage-limit/types/limit-consumption.type';

const pressure = ({
  limitValue,
  consumedValue,
}: {
  limitValue: number;
  consumedValue: number;
}) => (limitValue === 0 ? Infinity : consumedValue / limitValue);

export const selectAiChatUsage = ({
  limits,
  consumptionById,
}: {
  limits: FlatUsageLimit[];
  consumptionById: Map<string, LimitConsumption>;
}): AiChatUsageDTO | null => {
  const usages = limits.map((limit) => {
    const consumption = consumptionById.get(limit.id);

    return {
      limitValue: limit.limitValue,
      consumedValue: consumption?.consumedValue ?? null,
      periodEnd: consumption?.periodEnd ?? null,
      isUsageLimit: true,
    };
  });

  const unknownUsage = usages.find((usage) => !isDefined(usage.consumedValue));

  if (isDefined(unknownUsage)) {
    return unknownUsage;
  }

  const knownUsages = usages.flatMap(
    ({ limitValue, consumedValue, periodEnd, isUsageLimit }) =>
      isDefined(consumedValue)
        ? [{ limitValue, consumedValue, periodEnd, isUsageLimit }]
        : [],
  );

  // Several periods can apply simultaneously; surface the closest to exhaustion.
  return (
    knownUsages.sort((left, right) => pressure(right) - pressure(left))[0] ??
    null
  );
};
