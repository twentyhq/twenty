import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateFakeValue } from 'src/engine/utils/generate-fake-value';

export const generateFakeObjectRecord = <Entity>(
  objectMetadataEntity: ObjectMetadataEntity,
): Entity =>
  objectMetadataEntity.fields.reduce((acc, field) => {
    acc[field.name] = generateFakeValue(field.type);

    return acc;
  }, {} as Entity);
