import {
  FieldMetadataType,
  RelationType,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';

// An event carries a relation as its join column (companyId), never the related record
export const buildDatabaseEventTriggerConditionFields = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): ValidationRuleFieldDescriptor[] =>
  getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  ).flatMap((field) => {
    const isRelation =
      isFlatFieldMetadataOfType(field, FieldMetadataType.RELATION) ||
      isFlatFieldMetadataOfType(field, FieldMetadataType.MORPH_RELATION);

    if (!isRelation) {
      return [
        {
          name: field.name,
          type: field.type,
          universalIdentifier: field.universalIdentifier,
        },
      ];
    }

    if (field.settings.relationType !== RelationType.MANY_TO_ONE) {
      return [];
    }

    return [
      {
        name: computeMorphOrRelationFieldJoinColumnName({ name: field.name }),
        type: FieldMetadataType.UUID,
        universalIdentifier: field.universalIdentifier,
      },
    ];
  });
