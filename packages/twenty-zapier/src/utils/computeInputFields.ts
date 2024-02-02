import { capitalize } from '../utils/capitalize';
import { FieldMetadataType, InputField, Node } from '../utils/data.types';

const getTypeFromFieldMetadataType = (
  fieldMetadataType: string,
): string | undefined => {
  switch (fieldMetadataType) {
    case FieldMetadataType.UUID:
    case FieldMetadataType.TEXT:
    case FieldMetadataType.PHONE:
    case FieldMetadataType.EMAIL:
    case FieldMetadataType.LINK:
    case FieldMetadataType.RATING:
      return 'string';
    case FieldMetadataType.DATE_TIME:
      return 'datetime';
    case FieldMetadataType.BOOLEAN:
      return 'boolean';
    case FieldMetadataType.NUMBER:
      return 'integer';
    case FieldMetadataType.NUMERIC:
    case FieldMetadataType.PROBABILITY:
      return 'number';
    default:
      return undefined;
  }
};

export const computeInputFields = (
  node: Node,
  isRequired = false,
): InputField[] => {
  const result = [];
  for (const field of node.fields.edges) {
    const nodeField = field.node;
    switch (nodeField.type) {
      case FieldMetadataType.FULL_NAME:
      case FieldMetadataType.LINK:
      case FieldMetadataType.CURRENCY:
        for (const subField of Object.keys(nodeField.targetColumnMap)) {
          const field = {
            key: `${nodeField.name}__${subField}`,
            label: `${nodeField.label} (${capitalize(subField)})`,
            type: 'string',
            helpText: `${nodeField.description} (${subField})`,
            required: false,
          };
          result.push(field);
        }
        break;
      case FieldMetadataType.UUID:
      case FieldMetadataType.TEXT:
      case FieldMetadataType.PHONE:
      case FieldMetadataType.EMAIL:
      case FieldMetadataType.DATE_TIME:
      case FieldMetadataType.BOOLEAN:
      case FieldMetadataType.NUMBER:
      case FieldMetadataType.NUMERIC:
      case FieldMetadataType.PROBABILITY:
      case FieldMetadataType.RATING: {
        const nodeFieldType = getTypeFromFieldMetadataType(nodeField.type);
        if (!nodeFieldType) {
          break;
        }
        const required =
          (isRequired && nodeField.name === 'id') ||
          (!isRequired && !nodeField.isNullable && !nodeField.defaultValue);
        const field = {
          key: nodeField.name,
          label: nodeField.label,
          type: nodeFieldType,
          helpText: nodeField.description,
          required,
        };
        result.push(field);
        break;
      }
      default:
        break;
    }
  }

  return result.sort((a, _) => (a.key === 'id' ? -1 : 1));
};
