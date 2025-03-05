import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  Leaf,
  Node,
  RecordOutputSchema,
} from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { generateFakeField } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-field';
import { shouldGenerateFieldFakeValue } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/should-generate-field-fake-value';

const generateObjectRecordFields = (
  objectMetadataEntity: ObjectMetadataEntity,
) =>
  objectMetadataEntity.fields.reduce(
    (acc: Record<string, Leaf | Node>, field) => {
      if (!shouldGenerateFieldFakeValue(field)) {
        return acc;
      }

      acc[field.name] = generateFakeField({
        type: field.type,
        label: field.label,
        icon: field.icon,
      });

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
