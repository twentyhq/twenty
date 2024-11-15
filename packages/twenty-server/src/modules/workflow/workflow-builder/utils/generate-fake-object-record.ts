import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateFakeValue } from 'src/engine/utils/generate-fake-value';
import { shouldGenerateFieldFakeValue } from 'src/modules/workflow/workflow-builder/utils/should-generate-field-fake-value';
import { OutputSchema } from 'src/modules/workflow/workflow-builder/types/output-schema.type';

export const generateFakeObjectRecord = (
  objectMetadataEntity: ObjectMetadataEntity,
): OutputSchema =>
  objectMetadataEntity.fields.reduce((acc: OutputSchema, field) => {
    if (!shouldGenerateFieldFakeValue(field)) {
      return acc;
    }

    acc[field.name] = {
      isLeaf: true,
      type: field.type,
      icon: field.icon,
      value: generateFakeValue(field.type),
    };

    return acc;
  }, {});
