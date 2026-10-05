import { isDefined } from 'twenty-shared/utils';

import { getRecordDisplayName } from 'src/engine/core-modules/record-crud/utils/get-record-display-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type TimelineActivityRule } from 'src/modules/timeline/types/timeline-activity-rule.type';

export const resolveLinkedRecordCachedName = ({
  rule,
  record,
  flatFieldMetadataMaps,
}: {
  rule: TimelineActivityRule;
  record: Record<string, unknown> | undefined;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): string | undefined =>
  isDefined(record)
    ? getRecordDisplayName(
        record,
        rule.sourceFlatObjectMetadata,
        flatFieldMetadataMaps,
      )
    : undefined;
