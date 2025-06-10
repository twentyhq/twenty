import { FieldMetadataType } from 'twenty-shared/types';

type FakeValueTypes =
  | string
  | number
  | boolean
  | Date
  | FakeValueTypes[]
  | FieldMetadataType
  | { [key: string]: FakeValueTypes }
  | null;

type TypeClassification = 'Primitive' | 'FieldMetadataType';

const generatePrimitiveValue = (valueType: string): FakeValueTypes => {
  if (valueType === 'string') {
    return 'My text';
  } else if (valueType === 'number') {
    return 20;
  } else if (valueType === 'boolean') {
    return true;
  } else if (valueType === 'Date') {
    return new Date();
  } else if (valueType.endsWith('[]')) {
    const elementType = valueType.replace('[]', '');

    return Array.from({ length: 3 }, () => generateFakeValue(elementType));
  } else if (valueType.startsWith('{') && valueType.endsWith('}')) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  } else {
    return null;
  }
};

const generateFieldMetadataTypeValue = (
  valueType: string,
): FakeValueTypes | null => {
  // composite types do not need to be generated
  switch (valueType) {
    case FieldMetadataType.TEXT:
      return 'My text';
    case FieldMetadataType.NUMBER:
      return 20;
    case FieldMetadataType.BOOLEAN:
      return true;
    case FieldMetadataType.DATE:
      return '01/23/2025';
    case FieldMetadataType.DATE_TIME:
      return '01/23/2025 15:16';
    case FieldMetadataType.ADDRESS:
      return '123 Main St, Anytown, CA 12345';
    case FieldMetadataType.FULL_NAME:
      return 'Tim Cook';
    case FieldMetadataType.RAW_JSON:
      return null;
    case FieldMetadataType.RICH_TEXT:
      return 'My rich text';
    case FieldMetadataType.UUID:
      return '123e4567-e89b-12d3-a456-426614174000';
    default:
      return null;
  }
};

export const generateFakeValue = (
  valueType: string,
  classification: TypeClassification = 'Primitive',
): FakeValueTypes => {
  switch (classification) {
    case 'Primitive':
      return generatePrimitiveValue(valueType);
    case 'FieldMetadataType':
      return generateFieldMetadataTypeValue(valueType);
    default:
      return null;
  }
};
