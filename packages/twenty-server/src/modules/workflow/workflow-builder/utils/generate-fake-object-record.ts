import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateFakeValue } from 'src/engine/utils/generate-fake-value';
import { shouldGenerateFieldFakeValue } from 'src/modules/workflow/workflow-builder/utils/should-generate-field-fake-value';
import { OutputSchema } from 'src/modules/workflow/workflow-builder/types/output-schema.type';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';

export const generateFakeObjectRecord = (
  objectMetadataEntity: ObjectMetadataEntity,
): OutputSchema =>
  objectMetadataEntity.fields.reduce((acc: OutputSchema, field) => {
    if (!shouldGenerateFieldFakeValue(field)) {
      return acc;
    }
    const compositeType = compositeTypeDefinitions.get(field.type);

    if (!compositeType) {
      acc[field.name] = {
        isLeaf: true,
        type: field.type,
        icon: field.icon,
        value: generateFakeValue(field.type),
      };
    } else {
      acc[field.name] = {
        isLeaf: false,
        icon: field.icon,
        value: compositeType.properties.reduce((acc, property) => {
          acc[property.name] = {
            isLeaf: true,
            type: property.type,
            value: generateFakeValue(property.type),
          };

          return acc;
        }, {}),
      };
    }

    return acc;
  }, {});
