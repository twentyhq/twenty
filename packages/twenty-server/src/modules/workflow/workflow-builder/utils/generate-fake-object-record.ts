import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateFakeValue } from 'src/engine/utils/generate-fake-value';
import { shouldGenerateFieldFakeValue } from 'src/modules/workflow/workflow-builder/utils/should-generate-field-fake-value';

export const generateFakeObjectRecord = <Entity>(
  objectMetadataEntity: ObjectMetadataEntity,
): Entity =>
  objectMetadataEntity.fields.reduce((acc, field) => {
    if (!shouldGenerateFieldFakeValue(field)) {
      return acc;
    }

    acc[field.name] = generateFakeValue(field.type);

    return acc;
  }, {} as Entity);
