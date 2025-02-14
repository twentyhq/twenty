import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateFakeValue } from 'src/engine/utils/generate-fake-value';
import {
  Leaf,
  Node,
  RecordOutputSchema,
} from 'src/modules/workflow/workflow-builder/types/output-schema.type';
import { shouldGenerateFieldFakeValue } from 'src/modules/workflow/workflow-builder/utils/should-generate-field-fake-value';
import { camelToTitleCase } from 'src/utils/camel-to-title-case';

const generateObjectRecordFields = (
  objectMetadataEntity: ObjectMetadataEntity,
) =>
  objectMetadataEntity.fields.reduce(
    (acc: Record<string, Leaf | Node>, field) => {
      if (!shouldGenerateFieldFakeValue(field)) {
        return acc;
      }
      const compositeType = compositeTypeDefinitions.get(field.type);

      if (!compositeType) {
        acc[field.name] = {
          isLeaf: true,
          type: field.type,
          icon: field.icon,
          label: field.label,
          value: generateFakeValue(field.type, 'FieldMetadataType'),
        };
      } else {
        acc[field.name] = {
          isLeaf: false,
          icon: field.icon,
          label: field.label,
          value: compositeType.properties.reduce((acc, property) => {
            acc[property.name] = {
              isLeaf: true,
              type: property.type,
              label: camelToTitleCase(property.name),
              value: generateFakeValue(property.type, 'FieldMetadataType'),
            };

            return acc;
          }, {}),
        };
      }

      return acc;
    },
    {},
  );

export const generateFakeObjectRecord = (
  objectMetadataEntity: ObjectMetadataEntity,
): RecordOutputSchema => ({
  object: {
    isLeaf: true,
    icon: objectMetadataEntity.icon,
    label: objectMetadataEntity.labelSingular,
    value: objectMetadataEntity.description,
    nameSingular: objectMetadataEntity.nameSingular,
    fieldIdName: 'id',
  },
  fields: generateObjectRecordFields(objectMetadataEntity),
  _outputSchemaType: 'RECORD',
});
