import { capitalize } from '../utils/capitalize';

export type Node = {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description: string;
  isCustom: boolean;
  labelIdentifierFieldMetadataId: string | null;
  imageIdentifierFieldMetadataId: string | null;
  fields: {
    edges: {
      node: {
        id: string;
        type: string;
        name: string;
        label: string;
        description: string | null;
        icon: string | null;
        isCustom: boolean;
        targetColumnMap: object;
        isActive: boolean;
        isSystem: boolean;
        isNullable: boolean;
        createdAt: string;
        updatedAt: string;
        defaultValue: object | null;
        options: object | null;
        fromRelationMetadata: object | null;
        toRelationMetadata: object | null;
      };
    }[];
  };
};

export type InputField = {
  key: string;
  label: string;
  type: string;
  helpText: string | null;
  required: boolean;
};

enum FieldMetadataType {
  UUID = 'UUID',
  TEXT = 'TEXT',
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  DATE_TIME = 'DATE_TIME',
  BOOLEAN = 'BOOLEAN',
  NUMBER = 'NUMBER',
  NUMERIC = 'NUMERIC',
  PROBABILITY = 'PROBABILITY',
  LINK = 'LINK',
  CURRENCY = 'CURRENCY',
  FULL_NAME = 'FULL_NAME',
  RATING = 'RATING',
  SELECT = 'SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
  RELATION = 'RELATION',
}

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
