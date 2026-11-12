import { type FieldMetadataType } from 'twenty-shared/types';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const extractGraphQLRelationFieldNames = (
  fieldMetadata: FlatFieldMetadata<
    FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
  >,
) => {
  const fieldMetadataName = fieldMetadata.name;
  const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
    name: fieldMetadataName,
  });

  return { joinColumnName, fieldMetadataName };
};
