import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RuleFieldDenial } from 'src/engine/permissions/internal/masking/types/rule-field-denial.type';
import { filterFieldNamesInEventProperties } from 'src/engine/permissions/utils/filter-field-names-in-event-properties.util';
import { getFieldNamesInEventProperties } from 'src/engine/permissions/utils/get-field-names-in-event-properties.util';
import { isRecordMatchingFilter } from 'src/engine/permissions/utils/is-record-matching-filter.util';

export const omitRuleDeniedFieldsFromEvent = <
  TEvent extends ObjectRecordEvent,
>({
  event,
  ruleFieldDenials,
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  event: TEvent;
  ruleFieldDenials: RuleFieldDenial[];
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): TEvent => {
  const { properties } = event;
  const eventRecords = [
    'before' in properties ? properties.before : undefined,
    'after' in properties ? properties.after : undefined,
  ].filter(isDefined);

  // A record leaving the rule still shows values the rule denied in its before state
  const deniedFieldNames = new Set(
    ruleFieldDenials
      .filter(({ recordFilter }) =>
        eventRecords.some((record) =>
          isRecordMatchingFilter({
            record,
            filter: recordFilter,
            flatObjectMetadata,
            flatFieldMetadataMaps,
            shouldIgnoreSoftDeleteDefaultFilter: true,
          }),
        ),
      )
      .flatMap(({ unreadableFieldMetadataIds }) =>
        unreadableFieldMetadataIds.flatMap((fieldMetadataId) => {
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

  if (deniedFieldNames.size === 0) {
    return event;
  }

  return {
    ...event,
    properties: {
      ...event.properties,
      ...filterFieldNamesInEventProperties({
        properties: event.properties,
        isFieldNameKept: (fieldName) => !deniedFieldNames.has(fieldName),
      }),
    },
  };
};
