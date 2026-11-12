import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type UnreadableFieldsOnMatchingRecords } from 'src/engine/permissions/internal/field-access/types/unreadable-fields-on-matching-records.type';
import { findInaccessibleFieldMetadataIdsOnRecord } from 'src/engine/permissions/internal/field-access/utils/find-inaccessible-field-metadata-ids-on-record.util';

export const findUnreadableFieldMetadataIdsOnRecords = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  objectUnreadableFieldMetadataIds,
  records,
  unreadableFieldsOnMatchingRecords,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  objectUnreadableFieldMetadataIds: string[];
  records: object[];
  unreadableFieldsOnMatchingRecords: UnreadableFieldsOnMatchingRecords[];
}): Set<string> =>
  new Set([
    ...objectUnreadableFieldMetadataIds,
    ...records.flatMap((record) =>
      findInaccessibleFieldMetadataIdsOnRecord({
        flatObjectMetadata,
        flatFieldMetadataMaps,
        record,
        inaccessibleFieldsOnMatchingRecords: unreadableFieldsOnMatchingRecords,
      }),
    ),
  ]);
