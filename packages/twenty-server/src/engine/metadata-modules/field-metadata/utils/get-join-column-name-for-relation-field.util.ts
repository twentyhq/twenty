import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { isFieldMetadataSettingsOfType } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-settings-of-type.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

// The ORM derives relation columns from the field name, so fall back to it
// when settings carry no explicit join column.
export const getJoinColumnNameForRelationField = (
  flatFieldMetadata: FlatFieldMetadata,
): string => {
  const { settings } = flatFieldMetadata;

  if (
    isFieldMetadataSettingsOfType(settings, FieldMetadataType.RELATION) &&
    isDefined(settings.joinColumnName)
  ) {
    return settings.joinColumnName;
  }

  return computeMorphOrRelationFieldJoinColumnName({
    name: flatFieldMetadata.name,
  });
};
