import { FieldMetadataType } from '../types/FieldMetadataType';
import {
  type InputField,
  type Node,
  type NodeField,
} from '../utils/data.types';

const getListFromFieldMetadataType = (fieldMetadataType: FieldMetadataType) => {
  return fieldMetadataType === FieldMetadataType.ARRAY;
};

const getTypeFromFieldMetadataType = (
  fieldMetadataType: FieldMetadataType,
): string | undefined => {
  switch (fieldMetadataType) {
    case FieldMetadataType.UUID:
    case FieldMetadataType.TEXT:
    case FieldMetadataType.RICH_TEXT:
    case FieldMetadataType.ARRAY:
    case FieldMetadataType.RATING:
      return 'string';
    case FieldMetadataType.DATE_TIME:
      return 'datetime';
    case FieldMetadataType.DATE:
      return 'date';
    case FieldMetadataType.BOOLEAN:
      return 'boolean';
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.POSITION:
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
        type: FieldMetadataType.TEXT,
        name: 'firstName',
        label: 'First Name',
        description: 'First Name',
        isNullable: true,
        defaultValue: null,
      };
      const lastName: NodeField = {
        type: FieldMetadataType.TEXT,
        name: 'lastName',
        label: 'Last Name',
        description: 'Last Name',
        isNullable: true,
        defaultValue: null,
      };
      return [firstName, lastName];
    }
    case FieldMetadataType.CURRENCY: {
      const amountMicros: NodeField = {
        type: FieldMetadataType.NUMBER,
        name: 'amountMicros',
        label: 'Amount Micros',
        description: 'Amount Micros. eg: set 3210000 for 3.21$',
        isNullable: true,
        defaultValue: null,
      };
      const currencyCode: NodeField = {
        type: FieldMetadataType.TEXT,
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
        type: FieldMetadataType.TEXT,
        name: 'addressStreet1',
        label: 'Address',
        description: 'Address',
        isNullable: true,
        defaultValue: null,
      };
      const address2: NodeField = {
        type: FieldMetadataType.TEXT,
        name: 'addressStreet2',
        label: 'Address 2',
        description: 'Address 2',
        isNullable: true,
        defaultValue: null,
      };
      const city: NodeField = {
        type: FieldMetadataType.TEXT,
        name: 'addressCity',
        label: 'City',
        description: 'City',
        isNullable: true,
        defaultValue: null,
      };
      const state: NodeField = {
        type: FieldMetadataType.TEXT,
        name: 'addressState',
        label: 'State',
        description: 'State',
        isNullable: true,
        defaultValue: null,
      };
      const postalCode: NodeField = {
        type: FieldMetadataType.TEXT,
        name: 'addressPostalCode',
        label: 'Postal Code',
        description: 'Postal Code',
        isNullable: true,
        defaultValue: null,
      };
      const country: NodeField = {
        type: FieldMetadataType.TEXT,
        name: 'addressCountry',
        label: 'Country',
        description: 'Country',
        isNullable: true,
        defaultValue: null,
      };
      return [address1, address2, city, state, postalCode, country];
    }
    case FieldMetadataType.PHONES: {
      const primaryPhoneNumber: NodeField = {
        type: FieldMetadataType.TEXT,
        name: 'primaryPhoneNumber',
        label: 'Primary Phone Number',
        description: 'Primary Phone Number. 600112233',
        isNullable: true,
        defaultValue: null,
      };
      const primaryPhoneCountryCode: NodeField = {
        type: FieldMetadataType.TEXT,
        name: 'primaryPhoneCountryCode',
        label: 'Primary Phone Country Code',
        description: 'Primary Phone Country Code. eg: +33',
        isNullable: true,
        defaultValue: null,
      };
      const additionalPhones: NodeField = {
        type: FieldMetadataType.TEXT,
        name: 'additionalPhones',
        label: 'Additional Phones',
        description: 'Additional Phones',
        isNullable: true,
        defaultValue: null,
        placeholder: '{ number: "", callingCode: "" }',
        list: true,
      };
      return [primaryPhoneNumber, primaryPhoneCountryCode, additionalPhones];
    }
    case FieldMetadataType.EMAILS: {
      const primaryEmail: NodeField = {
        type: FieldMetadataType.TEXT,
        name: 'primaryEmail',
        label: 'Primary Email',
        description: 'Primary Email',
        isNullable: true,
        defaultValue: null,
      };
      const additionalEmails: NodeField = {
        type: FieldMetadataType.TEXT,
        name: 'additionalEmails',
        label: 'Additional Emails',
        description: 'Additional Emails',
        list: true,
        isNullable: true,
        defaultValue: null,
      };
      return [primaryEmail, additionalEmails];
    }
    case FieldMetadataType.LINKS: {
      const primaryLinkLabel: NodeField = {
        type: FieldMetadataType.TEXT,
        name: 'primaryLinkLabel',
        label: 'Primary Link Label',
        description: 'Primary Link Label',
        isNullable: true,
        defaultValue: null,
      };
      const primaryLinkUrl: NodeField = {
        type: FieldMetadataType.TEXT,
        name: 'primaryLinkUrl',
        label: 'Primary Link Url',
        description: 'Primary Link Url',
        isNullable: true,
        defaultValue: null,
      };
      const secondaryLinks: NodeField = {
        type: FieldMetadataType.TEXT,
        name: 'secondaryLinks',
        label: 'Secondary Links',
        description: 'Secondary Links',
        isNullable: true,
        defaultValue: null,
        placeholder: '{ url: "", label: "" }',
        list: true,
      };
      return [primaryLinkLabel, primaryLinkUrl, secondaryLinks];
    }
    default:
      throw new Error(`Unknown nodeField type: ${nodeField.type}`);
  }
};

const isFieldRequired = (nodeField: NodeField): boolean => {
  return !nodeField.isNullable && nodeField.defaultValue === null;
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
      case FieldMetadataType.CURRENCY:
      case FieldMetadataType.PHONES:
      case FieldMetadataType.EMAILS:
      case FieldMetadataType.LINKS:
      case FieldMetadataType.ADDRESS:
        for (const subNodeField of get_subfieldsFromField(nodeField)) {
          const field = {
            key: `${nodeField.name}__${subNodeField.name}`,
            label: `${nodeField.label}: ${subNodeField.label}`,
            type: getTypeFromFieldMetadataType(subNodeField.type),
            helpText: `${nodeField.description}: ${subNodeField.description}`,
            required: isFieldRequired(subNodeField),
            list: !!subNodeField.list,
            placeholder: subNodeField.placeholder,
          } as InputField;
          result.push(field);
        }
        break;
      case FieldMetadataType.UUID:
      case FieldMetadataType.TEXT:
      case FieldMetadataType.RICH_TEXT:
      case FieldMetadataType.DATE_TIME:
      case FieldMetadataType.DATE:
      case FieldMetadataType.BOOLEAN:
      case FieldMetadataType.NUMBER:
      case FieldMetadataType.NUMERIC:
      case FieldMetadataType.ARRAY:
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
          list: getListFromFieldMetadataType(nodeField.type),
          placeholder: undefined,
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
