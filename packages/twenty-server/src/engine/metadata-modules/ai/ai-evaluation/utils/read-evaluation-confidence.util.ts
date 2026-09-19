import { isDefined } from 'twenty-shared/utils';

// TypeSafe reports how concentrated each distribution is under its own provider
// metadata key, separately from the distribution. It is not a probability, so it
// is read out by name rather than folded into an answer.
const CONFIDENCE_PROVIDER_KEY = 'typesafe';

const isFiniteProbability = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= 1;

export const readEvaluationConfidence = (
  providerMetadata: Record<string, Record<string, unknown>> | undefined,
): Record<string, number> | undefined => {
  const confidence =
    providerMetadata?.[CONFIDENCE_PROVIDER_KEY]?.['confidence'];

  if (!isDefined(confidence) || typeof confidence !== 'object') {
    return undefined;
  }

  const entries = Object.entries(confidence).filter(
    (entry): entry is [string, number] => isFiniteProbability(entry[1]),
  );

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
};
