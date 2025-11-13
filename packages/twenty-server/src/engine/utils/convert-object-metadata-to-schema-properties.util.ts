import {
  FieldMetadataType,
  type FieldMetadataSettings,
  NumberDataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

export type SchemaObject = {
  type: string;
  format?: string;
  enum?: string[];
  items?: SchemaObject;
  properties?: Record<string, SchemaObject>;
  description?: string;
  [key: string]:
    | string
    | number
    | boolean
    | string[]
    | SchemaObject
    | Record<string, SchemaObject>
    | undefined;
};

const isFieldAvailable = (field: FieldMetadataEntity, forResponse: boolean) => {
  if (forResponse) {
    return true;
  }
  switch (field.name) {
    case 'id':
    case 'createdAt':
    case 'updatedAt':
    case 'deletedAt':
      return false;
    default:
      return true;
  }
};

const getFieldProperties = (field: FieldMetadataEntity): SchemaObject => {
  switch (field.type) {
    case FieldMetadataType.UUID: {
      return { type: 'string', format: 'uuid' };
    }
    case FieldMetadataType.TEXT:
    case FieldMetadataType.RICH_TEXT: {
      return { type: 'string' };
    }
    case FieldMetadataType.DATE_TIME: {
      return { type: 'string', format: 'date-time' };
    }
    case FieldMetadataType.DATE: {
      return { type: 'string', format: 'date' };
    }
    case FieldMetadataType.NUMBER: {
      const settings =
        field.settings as FieldMetadataSettings<FieldMetadataType.NUMBER>;

      if (
        settings?.dataType === NumberDataType.FLOAT ||
        (isDefined(settings?.decimals) && settings.decimals > 0)
      ) {
        return { type: 'number' };
      }

      return { type: 'integer' };
    }
    case FieldMetadataType.NUMERIC:
    case FieldMetadataType.POSITION: {
      return { type: 'number' };
    }
    case FieldMetadataType.BOOLEAN: {
      return { type: 'boolean' };
    }
    case FieldMetadataType.RAW_JSON: {
      return { type: 'object' };
    }
    default: {
      return { type: 'string' };
    }
  }
};

export const convertObjectMetadataToSchemaProperties = ({
  item,
  forResponse,
}: {
  item: ObjectMetadataEntity;
  forResponse: boolean;
}) => {
  return item.fields.reduce((node, field) => {
    if (
      !isFieldAvailable(field, forResponse) ||
      field.type === FieldMetadataType.TS_VECTOR
    ) {
      return node;
    }

    if (
      isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION) &&
      field.settings?.relationType === RelationType.MANY_TO_ONE
    ) {
      return {
        ...node,
        [`${field.name}Id`]: {
          type: 'string',
          format: 'uuid',
        },
      };
    }

    if (
      isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION) &&
      field.settings?.relationType === RelationType.ONE_TO_MANY
    ) {
      return node;
    }

    let itemProperty = {} as SchemaObject;

    switch (field.type) {
      case FieldMetadataType.MULTI_SELECT:
        itemProperty = {
          type: 'array',
          items: {
            type: 'string',
            enum: (field.options ?? []).map(
              (option: { value: string }) => option.value,
            ),
          },
        };
        break;
      case FieldMetadataType.SELECT:
        itemProperty = {
          type: 'string',
          enum: (field.options ?? []).map(
            (option: { value: string }) => option.value,
          ),
        };
        break;
      case FieldMetadataType.ARRAY:
        itemProperty = {
          type: 'array',
          items: {
            type: 'string',
          },
        };
        break;
      case FieldMetadataType.RATING:
        itemProperty = {
          type: 'string',
          enum: (field.options ?? []).map(
            (option: { value: string }) => option.value,
          ),
        };
        break;
      case FieldMetadataType.LINKS:
        itemProperty = {
          type: 'object',
          properties: {
            primaryLinkLabel: {
              type: 'string',
            },
            primaryLinkUrl: {
              type: 'string',
            },
            secondaryLinks: {
              type: 'array',
              items: {
                type: 'object',
                description: 'A secondary link',
                properties: {
                  url: {
                    type: 'string',
                    format: 'uri',
                  },
                  label: {
                    type: 'string',
                  },
                },
              },
            },
          },
        };
        break;
      case FieldMetadataType.CURRENCY:
        itemProperty = {
          type: 'object',
          properties: {
            amountMicros: {
              type: 'number',
            },
            currencyCode: {
              type: 'string',
            },
          },
        };
        break;
      case FieldMetadataType.FULL_NAME:
        itemProperty = {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
          },
        };
        break;
      case FieldMetadataType.ADDRESS:
        itemProperty = {
          type: 'object',
          properties: {
            addressStreet1: {
              type: 'string',
            },
            addressStreet2: {
              type: 'string',
            },
            addressCity: {
              type: 'string',
            },
            addressPostcode: {
              type: 'string',
            },
            addressState: {
              type: 'string',
            },
            addressCountry: {
              type: 'string',
            },
            addressLat: {
              type: 'number',
            },
            addressLng: {
              type: 'number',
            },
          },
        };
        break;
      case FieldMetadataType.ACTOR:
        itemProperty = {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              enum: [
                'EMAIL',
                'CALENDAR',
                'WORKFLOW',
                'AGENT',
                'API',
                'IMPORT',
                'MANUAL',
                'SYSTEM',
                'WEBHOOK',
              ],
            },
            ...(forResponse
              ? {
                  workspaceMemberId: {
                    type: 'string',
                    format: 'uuid',
                  },
                  name: {
                    type: 'string',
                  },
                }
              : {}),
          },
        };
        break;
      case FieldMetadataType.EMAILS:
        itemProperty = {
          type: 'object',
          properties: {
            primaryEmail: {
              type: 'string',
            },
            additionalEmails: {
              type: 'array',
              items: {
                type: 'string',
                format: 'email',
              },
            },
          },
        };
        break;
      case FieldMetadataType.PHONES:
        itemProperty = {
          properties: {
            additionalPhones: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            primaryPhoneCountryCode: {
              type: 'string',
            },
            primaryPhoneCallingCode: {
              type: 'string',
            },
            primaryPhoneNumber: {
              type: 'string',
            },
          },
          type: 'object',
        };
        break;
      case FieldMetadataType.RICH_TEXT_V2:
        itemProperty = {
          type: 'object',
          properties: {
            blocknote: {
              type: 'string',
            },
            markdown: {
              type: 'string',
            },
          },
        };
        break;
      default:
        itemProperty = getFieldProperties(field);
        break;
    }

    if (field.description) {
      itemProperty.description = field.description;
    }

    if (Object.keys(itemProperty).length) {
      return { ...node, [field.name]: itemProperty };
    }

    return node;
  }, {});
};
