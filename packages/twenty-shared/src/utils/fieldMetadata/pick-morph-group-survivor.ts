type MorphGroupSurvivorCandidate = {
  id: string;
  isActive?: boolean | null;
  isSystem?: boolean | null;
};

const scoreMorphField = (field: MorphGroupSurvivorCandidate): number =>
  (field.isActive ? 2 : 0) + (field.isSystem ? 0 : 1);

export const pickMorphGroupSurvivor = <T extends MorphGroupSurvivorCandidate>(
  group: T[],
): T =>
  group.reduce((best, current) => {
    const scoreDifference = scoreMorphField(current) - scoreMorphField(best);

    return scoreDifference > 0 ||
      (scoreDifference === 0 && current.id < best.id)
      ? current
      : best;
  });
