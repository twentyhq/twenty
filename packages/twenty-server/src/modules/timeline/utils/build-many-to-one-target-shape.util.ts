import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type TimelineActivityRuleTargetShape } from 'src/modules/timeline/types/timeline-activity-rule.type';
import { buildTargetJoinColumn } from 'src/modules/timeline/utils/build-target-join-column.util';

// A many-to-one relation is a lookup on the rule object: its join column points
// at the single record whose timeline receives the entries. Eligibility is
// decided by buildRelationTargetShape.
export const buildManyToOneTargetShape = ({
  relationFlatFieldMetadata,
  flatObjectMetadataMaps,
}: {
  relationFlatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): TimelineActivityRuleTargetShape | undefined => {
  const targetJoinColumn = buildTargetJoinColumn({
    flatFieldMetadata: relationFlatFieldMetadata,
    flatObjectMetadataMaps,
  });

  if (!isDefined(targetJoinColumn)) {
    return undefined;
  }

  return {
    kind: 'MANY_TO_ONE',
    relationFieldName: relationFlatFieldMetadata.name,
    targetJoinColumn,
  };
};
