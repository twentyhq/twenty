// A morph relation is stored as one field metadata per target object, all
// sharing a `morphId`. When collapsing a morph group into the single field that
// represents it, both the server (objects.fieldsList) and the client must pick
// the same survivor so they agree on which sub-field id represents the relation.
//
// Prefers active, non-system fields (standard targets) over system ones
// (auto-created for custom objects). Smallest id breaks ties.
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
