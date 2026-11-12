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

export const toDatabaseEventTriggerConditionField = ({
  name,
  type,
  universalIdentifier,
  relationType,
}: {
  name: string;
  type: FieldMetadataType;
  universalIdentifier: string;
  relationType?: RelationType;
}): ValidationRuleFieldDescriptor | undefined => {
  if (
    type !== FieldMetadataType.RELATION &&
    type !== FieldMetadataType.MORPH_RELATION
  ) {
    return { name, type, universalIdentifier };
  }

  if (relationType !== RelationType.MANY_TO_ONE) {
    return undefined;
  }

  return {
    name: computeMorphOrRelationFieldJoinColumnName({ name }),
    type: FieldMetadataType.UUID,
    universalIdentifier,
  };
};

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
    const conditionField = toDatabaseEventTriggerConditionField({
      name: field.name,
      type: field.type,
      universalIdentifier: field.universalIdentifier,
      relationType:
        isFlatFieldMetadataOfType(field, FieldMetadataType.RELATION) ||
        isFlatFieldMetadataOfType(field, FieldMetadataType.MORPH_RELATION)
          ? field.settings.relationType
          : undefined,
    });

    return conditionField ? [conditionField] : [];
  });
