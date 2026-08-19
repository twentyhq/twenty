import { isDefined } from 'twenty-shared/utils';

import { type FlatTimelineActivityRule } from 'src/engine/metadata-modules/flat-timeline-activity-rule/types/flat-timeline-activity-rule.type';

// The persisted override of an object's derived self rule: same object, no
// relation field, materialized. Kept in one place so the settings API and the
// write engine cannot drift apart on what overrides a self rule.
export const findSelfOverrideFlatTimelineActivityRule = ({
  persistedFlatRules,
  objectMetadataId,
}: {
  persistedFlatRules: FlatTimelineActivityRule[];
  objectMetadataId: string;
}): FlatTimelineActivityRule | undefined =>
  persistedFlatRules.find(
    (flatRule) =>
      flatRule.objectMetadataId === objectMetadataId &&
      !isDefined(flatRule.relationFieldMetadataId) &&
      flatRule.resolution === 'MATERIALIZED',
  );
