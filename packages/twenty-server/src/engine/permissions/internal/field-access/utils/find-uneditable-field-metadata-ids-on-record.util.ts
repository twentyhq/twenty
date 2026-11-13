import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type UneditableFieldsOnMatchingRecords } from 'src/engine/permissions/internal/field-access/types/uneditable-fields-on-matching-records.type';
import { findInaccessibleFieldMetadataIdsOnRecord } from 'src/engine/permissions/internal/field-access/utils/find-inaccessible-field-metadata-ids-on-record.util';

export const findUneditableFieldMetadataIdsOnRecord = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  record,
  uneditableFieldsOnMatchingRecords,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  record: object;
  uneditableFieldsOnMatchingRecords: UneditableFieldsOnMatchingRecords[];
}): Set<string> =>
  new Set(
    findInaccessibleFieldMetadataIdsOnRecord({
      flatObjectMetadata,
      flatFieldMetadataMaps,
      record,
      inaccessibleFieldsOnMatchingRecords: uneditableFieldsOnMatchingRecords,
    }),
  );
