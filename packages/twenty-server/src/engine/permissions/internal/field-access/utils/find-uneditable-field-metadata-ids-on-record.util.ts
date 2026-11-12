import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FieldsHiddenOnMatchingRecords } from 'src/engine/permissions/internal/field-access/types/fields-hidden-on-matching-records.type';
import { findFieldMetadataIdsListedByEveryMatchingRlsRule } from 'src/engine/permissions/internal/field-access/utils/find-field-metadata-ids-listed-by-every-matching-rls-rule.util';

export const findUneditableFieldMetadataIdsOnRecord = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  record,
  fieldsUneditableOnMatchingRecords,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  record: object;
  fieldsUneditableOnMatchingRecords: FieldsHiddenOnMatchingRecords[];
}): Set<string> =>
  new Set(
    findFieldMetadataIdsListedByEveryMatchingRlsRule({
      flatObjectMetadata,
      flatFieldMetadataMaps,
      record,
      rlsRuleFieldLists: fieldsUneditableOnMatchingRecords,
    }),
  );
