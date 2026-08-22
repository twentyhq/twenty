import { isDefined } from 'twenty-shared/utils';

import { getRecordDisplayName } from 'src/engine/core-modules/record-crud/utils/get-record-display-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type TimelineActivityRule } from 'src/modules/timeline/types/timeline-activity-rule.type';

// Shared so both event streams label a linked record the same way, including
// composite label identifiers such as a person full name.
export const resolveLinkedRecordCachedName = ({
  rule,
  record,
  flatFieldMetadataMaps,
}: {
  rule: TimelineActivityRule;
  record: Record<string, unknown> | undefined;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): string | undefined =>
  isDefined(record)
    ? getRecordDisplayName(
        record,
        rule.sourceFlatObjectMetadata,
        flatFieldMetadataMaps,
      )
    : undefined;
