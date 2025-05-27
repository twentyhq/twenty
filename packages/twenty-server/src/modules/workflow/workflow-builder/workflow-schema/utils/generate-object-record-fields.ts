import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { BaseOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { generateFakeField } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-field';
import { shouldGenerateFieldFakeValue } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/should-generate-field-fake-value';

export const generateObjectRecordFields = (
  objectMetadataEntity: ObjectMetadataEntity,
): BaseOutputSchema =>
  objectMetadataEntity.fields.reduce((acc: BaseOutputSchema, field) => {
    if (!shouldGenerateFieldFakeValue(field)) {
      return acc;
    }

    acc[field.name] = generateFakeField({
      type: field.type,
      label: field.label,
      icon: field.icon,
    });

    return acc;
  }, {} as BaseOutputSchema);
