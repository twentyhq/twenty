import {
  FieldMetadataType,
  InputField,
  Node,
  NodeField,
} from '../utils/data.types';

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

const get_subfieldsFromField = (nodeField: NodeField): NodeField[] => {
  switch (nodeField.type) {
    case FieldMetadataType.FULL_NAME: {
      const firstName: NodeField = {
        type: 'TEXT',
        name: 'firstName',
        label: 'First Name',
        description: 'First Name',
        isNullable: true,
        defaultValue: null,
      };
      const lastName: NodeField = {
        type: 'TEXT',
        name: 'lastName',
        label: 'Last Name',
        description: 'Last Name',
        isNullable: true,
        defaultValue: null,
      };
      return [firstName, lastName];
    }
    case FieldMetadataType.LINK: {
      const url: NodeField = {
        type: 'TEXT',
        name: 'url',
        label: 'Url',
        description: 'Link Url',
        isNullable: true,
        defaultValue: null,
      };
      const label: NodeField = {
        type: 'TEXT',
        name: 'label',
        label: 'Label',
        description: 'Link Label',
        isNullable: true,
        defaultValue: null,
      };
      return [url, label];
    }
    case FieldMetadataType.CURRENCY: {
      const amountMicros: NodeField = {
        type: 'NUMBER',
        name: 'amountMicros',
        label: 'Amount Micros',
        description: 'Amount Micros. eg: set 3210000 for 3.21$',
        isNullable: true,
        defaultValue: null,
      };
      const currencyCode: NodeField = {
        type: 'TEXT',
        name: 'currencyCode',
        label: 'Currency Code',
        description: 'Currency Code. eg: USD, EUR, etc...',
        isNullable: true,
        defaultValue: null,
      };
      return [amountMicros, currencyCode];
    }
    default:
      throw new Error(`Unknown nodeField type: ${nodeField.type}`);
  }
};

const isFieldRequired = (nodeField: NodeField): boolean => {
  return !nodeField.isNullable && !nodeField.defaultValue;
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
        for (const subNodeField of get_subfieldsFromField(nodeField)) {
          const field = {
            key: `${nodeField.name}__${subNodeField.name}`,
            label: `${nodeField.label}: ${subNodeField.label}`,
            type: getTypeFromFieldMetadataType(subNodeField.type),
            helpText: `${nodeField.description}: ${subNodeField.description}`,
            required: isFieldRequired(subNodeField),
          } as InputField;
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
          (!isRequired && isFieldRequired(nodeField));
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
