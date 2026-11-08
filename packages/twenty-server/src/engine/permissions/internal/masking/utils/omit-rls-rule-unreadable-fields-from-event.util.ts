import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type UnreadableFieldsWithRlsRuleFilter } from 'src/engine/permissions/internal/masking/types/unreadable-fields-with-rls-rule-filter.type';
import { filterFieldNamesInEventProperties } from 'src/engine/permissions/utils/filter-field-names-in-event-properties.util';
import { getFieldNamesInEventProperties } from 'src/engine/permissions/utils/get-field-names-in-event-properties.util';
import { isRecordMatchingFilter } from 'src/engine/permissions/utils/is-record-matching-filter.util';

export const omitRlsRuleUnreadableFieldsFromEvent = <
  TEvent extends ObjectRecordEvent,
>({
  event,
  unreadableFieldsWithRlsRuleFilter,
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  event: TEvent;
  unreadableFieldsWithRlsRuleFilter: UnreadableFieldsWithRlsRuleFilter[];
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): TEvent => {
  const { properties } = event;
  const eventRecords = [
    'before' in properties ? properties.before : undefined,
    'after' in properties ? properties.after : undefined,
  ].filter(isDefined);

  // A record leaving the RLS rule still shows unreadable values in its before state
  const unreadableFieldNames = new Set(
    unreadableFieldsWithRlsRuleFilter
      .filter(({ rlsRuleFilter }) =>
        eventRecords.some((record) =>
          isRecordMatchingFilter({
            record,
            filter: rlsRuleFilter,
            flatObjectMetadata,
            flatFieldMetadataMaps,
            shouldIgnoreSoftDeleteDefaultFilter: true,
          }),
        ),
      )
      .flatMap(({ fieldMetadataIds }) =>
        fieldMetadataIds.flatMap((fieldMetadataId) => {
          const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: fieldMetadataId,
            flatEntityMaps: flatFieldMetadataMaps,
          });

          return isDefined(flatFieldMetadata)
            ? getFieldNamesInEventProperties(flatFieldMetadata)
            : [];
        }),
      ),
  );

  if (unreadableFieldNames.size === 0) {
    return event;
  }

  return {
    ...event,
    properties: {
      ...event.properties,
      ...filterFieldNamesInEventProperties({
        properties: event.properties,
        isFieldNameKept: (fieldName) => !unreadableFieldNames.has(fieldName),
      }),
    },
  };
};
