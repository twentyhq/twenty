import {
  FieldMetadataType,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';
import { toDatabaseEventValidationRuleField } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';

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
    const conditionField = toDatabaseEventValidationRuleField({
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
