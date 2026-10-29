import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { type ObjectsPermissions } from 'twenty-shared/types';

import { isUpdateOfHiddenFieldsOnly } from 'src/engine/core-modules/record-share/utils/is-update-of-hidden-fields-only.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { omitRestrictedFieldsFromEvent } from 'src/engine/metadata-modules/permissions/utils/omit-restricted-fields-from-event.util';

export const omitHiddenFieldsFromEvents = <TEvent extends ObjectRecordEvent>({
  events,
  objectMetadata,
  objectsPermissions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  events: TEvent[];
  objectMetadata: Pick<FlatObjectMetadata, 'id' | 'nameSingular'>;
  objectsPermissions: ObjectsPermissions;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): TEvent[] =>
  events
    .map((event) =>
      omitRestrictedFieldsFromEvent({
        event,
        objectMetadata,
        objectsPermissions,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    )
    .filter((event) => !isUpdateOfHiddenFieldsOnly(event));
