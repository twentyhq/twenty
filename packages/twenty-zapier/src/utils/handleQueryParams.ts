import { type FieldMetadataType } from 'twenty-shared/types';
import { isFieldMetadataEnumKind } from 'twenty-shared/utils';
import { type InputData, type Node } from 'src/utils/data.types';

const RAW_JSON_SUBFIELD_NAMES = ['secondaryLinks', 'additionalPhones'];

const isPlainObject = (value: unknown): value is InputData =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getFieldTypeByName = (node?: Node): Map<string, FieldMetadataType> =>
  new Map(
    (node?.fields.edges ?? []).map((edge) => [edge.node.name, edge.node.type]),
  );

const nestCompositeFields = (inputData: InputData): InputData => {
  const nestedInputData: InputData = {};
  for (const [key, value] of Object.entries(inputData)) {
    if (key.includes('__')) {
      const [fieldName, subFieldName] = key.split('__');
      nestedInputData[fieldName] = {
        ...nestedInputData[fieldName],
        [subFieldName]: value,
      };
    } else {
      nestedInputData[key] = value;
    }
  }
  return nestedInputData;
};

const isUnquotedField = (
  fieldName: string,
  fieldTypeByName: Map<string, FieldMetadataType>,
): boolean => {
  const fieldType = fieldTypeByName.get(fieldName);
  return (
    (fieldType !== undefined && isFieldMetadataEnumKind(fieldType)) ||
    RAW_JSON_SUBFIELD_NAMES.includes(fieldName)
  );
};

const serializeValue = (
  fieldName: string,
  value: unknown,
  fieldTypeByName: Map<string, FieldMetadataType>,
): string => {
  if (Array.isArray(value)) {
    const items = value.map((item) =>
      serializeValue(fieldName, item, fieldTypeByName),
    );
    return `[${items.join(', ')}]`;
  }
  if (isPlainObject(value)) {
    return `{${serializeFields(value, fieldTypeByName)}}`;
  }
  if (
    typeof value === 'string' &&
    !isUnquotedField(fieldName, fieldTypeByName)
  ) {
    return `"${value}"`;
  }
  return `${value}`;
};

const serializeFields = (
  inputData: InputData,
  fieldTypeByName: Map<string, FieldMetadataType>,
): string =>
  Object.entries(inputData)
    .map(
      ([key, value]) =>
        `${key}: ${serializeValue(key, value, fieldTypeByName)}`,
    )
    .join(', ');

const handleQueryParams = (inputData: InputData, node?: Node): string =>
  serializeFields(nestCompositeFields(inputData), getFieldTypeByName(node));

export default handleQueryParams;
