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
      return 'string'
    case FieldMetadataType.EMAIL:
      return 'string'
    case FieldMetadataType.LINKS:
      return 'string';
    case FieldMetadataType.RATING:
      return 'string';
    case FieldMetadataType.DATE_TIME:
      return 'datetime';
    case FieldMetadataType.DATE:
      return 'date';
    case FieldMetadataType.BOOLEAN:
      return 'boolean';
    case FieldMetadataType.NUMBER:
      return 'integer';
    case FieldMetadataType.NUMERIC:
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
    case FieldMetadataType.LINKS: {
      const primaryLinkUrl: NodeField = {
        type: 'TEXT',
        name: 'url',
        label: 'Url',
        description: 'Link Url',
        isNullable: true,
        defaultValue: null,
      };
      const primaryLinkLabel: NodeField = {
        type: 'TEXT',
        name: 'label',
        label: 'Label',
        description: 'Link Label',
        isNullable: true,
        defaultValue: null,
      };
      const secondaryLinks: NodeField = {
        type: 'RAW_JSON',
        name: 'links',
        label: 'Links',
        description: 'Links',
        isNullable: true,
        defaultValue: null,
      }
      return [primaryLinkUrl, primaryLinkLabel, secondaryLinks];
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
    case FieldMetadataType.ADDRESS: {
      const address1: NodeField = {
        type: 'TEXT',
        name: 'addressStreet1',
        label: 'Address',
        description: 'Address',
        isNullable: true,
        defaultValue: null,
      };
      const address2: NodeField = {
        type: 'TEXT',
        name: 'addressStreet2',
        label: 'Address 2',
        description: 'Address 2',
        isNullable: true,
        defaultValue: null,
      };
      const city: NodeField = {
        type: 'TEXT',
        name: 'addressCity',
        label: 'City',
        description: 'City',
        isNullable: true,
        defaultValue: null,
      };
      const state: NodeField = {
        type: 'TEXT',
        name: 'addressState',
        label: 'State',
        description: 'State',
        isNullable: true,
        defaultValue: null,
      };
      const postalCode: NodeField = {
        type: 'TEXT',
        name: 'addressPostalCode',
        label: 'Postal Code',
        description: 'Postal Code',
        isNullable: true,
        defaultValue: null,
      };
      const country: NodeField = {
        type: 'TEXT',
        name: 'addressCountry',
        label: 'Country',
        description: 'Country',
        isNullable: true,
        defaultValue: null,
      };
      return [address1, address2, city, state, postalCode, country];
    }
    case FieldMetadataType.PHONE: {
      const primaryPhoneNumber: NodeField = {
        type: 'TEXT',
        name: 'phoneNumber',
        label: 'Phone Number',
        description: 'Phone Number',
        isNullable: true,
        defaultValue: null,
      };
      const primaryPhoneCountryCode: NodeField = {
        type: 'TEXT',
        name: 'phoneCountrtyCode',
        label: 'Country Code',
        description: 'Country Code',
        isNullable: true,
        defaultValue: null,
      };
      const additionalPhones: NodeField = {
        type: 'RAW_JSON',
        name: 'additionalPhoneNumbers',
        label: 'Additional Phone Numbers',
        description: 'Additional Phone Numbers',
        isNullable: true,
        defaultValue: null,
      };
      return [primaryPhoneNumber, primaryPhoneCountryCode, additionalPhones];
    }
    case FieldMetadataType.EMAIL: {
      const primaryEmail: NodeField = {
        type: 'TEXT',
        name: 'email',
        label: 'Email',
        description: 'Email',
        isNullable: true,
        defaultValue: null,
      };
      const additionalEmails: NodeField = {
        type: 'RAW_JSON',
        name: 'additionalEmails',
        label: 'Additional Emails',
        description: 'Additional Emails',
        isNullable: true,
        defaultValue: null,
      };
      return [primaryEmail, additionalEmails];
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
      case FieldMetadataType.LINKS:
      case FieldMetadataType.CURRENCY:
      case FieldMetadataType.ADDRESS:
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
      case FieldMetadataType.DATE:
      case FieldMetadataType.BOOLEAN:
      case FieldMetadataType.NUMBER:
      case FieldMetadataType.NUMERIC:
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
