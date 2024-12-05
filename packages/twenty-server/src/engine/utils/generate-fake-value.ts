import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

type FakeValueTypes =
  | string
  | number
  | boolean
  | Date
  | FakeValueTypes[]
  | FieldMetadataType
  | { [key: string]: FakeValueTypes };

export const generateFakeValue = (valueType: string): FakeValueTypes => {
  if (valueType === 'string') {
    return 'generated-string-value';
  } else if (valueType === 'number') {
    return 1;
  } else if (valueType === 'boolean') {
    return true;
  } else if (valueType === 'Date') {
    return new Date();
  } else if (valueType.endsWith('[]')) {
    const elementType = valueType.replace('[]', '');

    return Array.from({ length: 3 }, () => generateFakeValue(elementType));
  } else if (valueType.startsWith('{') && valueType.endsWith('}')) {
    const objData: Record<string, any> = {};

    const properties = valueType
      .slice(1, -1)
      .split(';')
      .map((p) => p.trim())
      .filter((p) => p);

    properties.forEach((property) => {
      const [key, valueType] = property.split(':').map((s) => s.trim());

      objData[key] = generateFakeValue(valueType);
    });

    return objData;
  } else if (valueType === FieldMetadataType.TEXT) {
    return 'My text';
  } else {
    return 'generated-string-value';
  }
};
