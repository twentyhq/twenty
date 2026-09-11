import { AI_MODEL_TIERS, type AiModelTier } from 'twenty-shared/ai';

// The tier itself first, then its neighbours by distance, the lower rung
// before the higher one at equal distance so a missing rung borrows the
// cheaper side of the ladder.
export const getAiModelTiersByDistance = (tier: AiModelTier): AiModelTier[] => {
  const tierIndex = AI_MODEL_TIERS.indexOf(tier);
  const distanceOf = (candidate: AiModelTier) =>
    Math.abs(AI_MODEL_TIERS.indexOf(candidate) - tierIndex);

  return [...AI_MODEL_TIERS].sort(
    (first, second) =>
      distanceOf(first) - distanceOf(second) ||
      AI_MODEL_TIERS.indexOf(first) - AI_MODEL_TIERS.indexOf(second),
  );
};
