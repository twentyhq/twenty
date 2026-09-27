import { isNonEmptyString } from '@sniptt/guards';
import { type CountryCode, parsePhoneNumberWithError } from 'libphonenumber-js';
import { z } from 'zod';

import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RelationType } from '@/types/RelationType';
import { assertUnreachable } from '@/utils/assertUnreachable';
import { getSpreadsheetImportCompositeSubFieldKey } from '@/utils/spreadsheet-import/getSpreadsheetImportCompositeSubFieldKey';
import { getSpreadsheetImportLinksVariant } from '@/utils/spreadsheet-import/getSpreadsheetImportLinksVariant';
import { isSpreadsheetImportCompositeFieldType } from '@/utils/spreadsheet-import/isSpreadsheetImportCompositeFieldType';
import {
  parseSpreadsheetImportDateTime,
  parseSpreadsheetImportPlainDate,
} from '@/utils/spreadsheet-import/parseSpreadsheetImportDate';
import { type ImportedStructuredRow } from '@/utils/spreadsheet-import/types/ImportedStructuredRow';
import { type SpreadsheetImportFieldMetadata } from '@/utils/spreadsheet-import/types/SpreadsheetImportFieldMetadata';
import { getLinkUrlNormalizer } from '@/utils/url/getLinkUrlNormalizer';
import { normalizeUrlOrigin } from '@/utils/url/normalizeUrlOrigin';
import { isDefined } from '@/utils/validation/isDefined';
import { isEmptyObject } from '@/utils/validation/isEmptyObject';

type RelationConnectField = {
  key: string;
  fieldMetadataItemId: string;
  compositeSubFieldKey?: string;
  uniqueFieldMetadataItem?: Pick<
    SpreadsheetImportFieldMetadata,
    'name' | 'type'
  >;
};

type SubFieldTransform = ((value: any) => unknown) | undefined;

type CompositeFieldTransformConfig = Record<string, SubFieldTransform>;

const castToString = (value: unknown) => String(value ?? '');

const stripSimpleQuotes = (value: unknown) =>
  typeof value === 'string' && value.startsWith("'") && value.endsWith("'")
    ? value.slice(1, -1)
    : value;

const parseJsonArray = <TItem extends z.ZodType>(itemSchema: TItem) =>
  z
    .preprocess((value) => {
      try {
        return typeof value === 'string' ? JSON.parse(value) : [];
      } catch {
        return [];
      }
    }, z.array(itemSchema))
    .catch([]);

const STRING_ARRAY_JSON_SCHEMA = parseJsonArray(z.string());

const LINK_ARRAY_JSON_SCHEMA = parseJsonArray(
  z.object({ label: z.string().nullable(), url: z.string().nullable() }),
);

const PHONE_ARRAY_JSON_SCHEMA = parseJsonArray(
  z.object({
    number: z.string(),
    callingCode: z.string(),
    countryCode: z.string(),
  }),
);

const COMPOSITE_FIELD_TRANSFORM_CONFIGS: Partial<
  Record<FieldMetadataType, CompositeFieldTransformConfig>
> = {
  [FieldMetadataType.CURRENCY]: {
    amountMicros: (value) => Math.round(Number(value) * 1000000),
    currencyCode: undefined,
  },
  [FieldMetadataType.ADDRESS]: {
    addressStreet1: castToString,
    addressStreet2: castToString,
    addressCity: castToString,
    addressPostcode: castToString,
    addressState: castToString,
    addressCountry: castToString,
  },
  [FieldMetadataType.LINKS]: {
    primaryLinkLabel: castToString,
    // Resolved lazily: the utils barrel imports this module before url utils
    primaryLinkUrl: (value) => normalizeUrlOrigin(value),
    secondaryLinks: (value) => LINK_ARRAY_JSON_SCHEMA.parse(value),
  },
  [FieldMetadataType.PHONES]: {
    primaryPhoneCountryCode: castToString,
    primaryPhoneNumber: castToString,
    primaryPhoneCallingCode: castToString,
    additionalPhones: (value) => PHONE_ARRAY_JSON_SCHEMA.parse(value),
  },
  [FieldMetadataType.RICH_TEXT]: {
    blocknote: castToString,
    markdown: castToString,
  },
  [FieldMetadataType.EMAILS]: {
    primaryEmail: (value) => castToString(value).toLowerCase(),
    additionalEmails: (value) => STRING_ARRAY_JSON_SCHEMA.parse(value),
  },
  [FieldMetadataType.FULL_NAME]: {
    firstName: undefined,
    lastName: undefined,
  },
};

const buildCompositeFieldRecord = (
  field: SpreadsheetImportFieldMetadata,
  importedStructuredRow: ImportedStructuredRow,
  compositeFieldConfig: CompositeFieldTransformConfig,
): Record<string, unknown> | undefined => {
  const compositeFieldRecord = Object.entries(compositeFieldConfig).reduce<
    Record<string, unknown>
  >((record, [compositeFieldKey, transform]) => {
    const value =
      importedStructuredRow[
        getSpreadsheetImportCompositeSubFieldKey(field, compositeFieldKey)
      ];

    return isDefined(value)
      ? { ...record, [compositeFieldKey]: transform?.(value) || value }
      : record;
  }, {});

  return isEmptyObject(compositeFieldRecord) ? undefined : compositeFieldRecord;
};

const buildRelationConnectFieldRecord = (
  fieldMetadataItem: SpreadsheetImportFieldMetadata,
  importedStructuredRow: ImportedStructuredRow,
  spreadsheetImportFields: readonly RelationConnectField[],
) => {
  if (fieldMetadataItem.relation?.type !== RelationType.MANY_TO_ONE) {
    return undefined;
  }

  const relationConnectFieldValue = spreadsheetImportFields
    .filter(
      (field) =>
        field.fieldMetadataItemId === fieldMetadataItem.id &&
        isNonEmptyString(importedStructuredRow[field.key]),
    )
    .reduce<Record<string, any>>((connectWhere, field) => {
      const uniqueFieldMetadataItem = field.uniqueFieldMetadataItem;

      if (!isDefined(uniqueFieldMetadataItem)) {
        return connectWhere;
      }

      if (
        isSpreadsheetImportCompositeFieldType(uniqueFieldMetadataItem.type) &&
        isDefined(field.compositeSubFieldKey)
      ) {
        const rawValue = importedStructuredRow[field.key];
        const transform =
          COMPOSITE_FIELD_TRANSFORM_CONFIGS[uniqueFieldMetadataItem.type]?.[
            field.compositeSubFieldKey
          ];

        return {
          ...connectWhere,
          [uniqueFieldMetadataItem.name]: {
            ...connectWhere[uniqueFieldMetadataItem.name],
            [field.compositeSubFieldKey]: isDefined(transform)
              ? transform(rawValue)
              : rawValue,
          },
        };
      }

      return {
        ...connectWhere,
        [uniqueFieldMetadataItem.name]: importedStructuredRow[field.key],
      };
    }, {});

  return isEmptyObject(relationConnectFieldValue)
    ? undefined
    : { connect: { where: relationConnectFieldValue } };
};

const buildPhonesFieldRecord = (
  field: SpreadsheetImportFieldMetadata,
  importedStructuredRow: ImportedStructuredRow,
) => {
  const compositeData = buildCompositeFieldRecord(
    field,
    importedStructuredRow,
    COMPOSITE_FIELD_TRANSFORM_CONFIGS[FieldMetadataType.PHONES] ?? {},
  );

  if (!isDefined(compositeData)) {
    return undefined;
  }

  const getSubFieldValue = (subFieldName: string) =>
    importedStructuredRow[
      getSpreadsheetImportCompositeSubFieldKey(field, subFieldName)
    ];

  const primaryPhoneNumber = getSubFieldValue('primaryPhoneNumber');
  const primaryPhoneCallingCode = getSubFieldValue('primaryPhoneCallingCode');

  // The server requires a calling code whenever a primary number is set
  if (
    !isDefined(primaryPhoneNumber) ||
    isNonEmptyString(primaryPhoneCallingCode)
  ) {
    return compositeData;
  }

  const primaryPhoneCountryCode = getSubFieldValue('primaryPhoneCountryCode');

  try {
    const { number, countryCallingCode } = parsePhoneNumberWithError(
      primaryPhoneNumber as string,
      isNonEmptyString(primaryPhoneCountryCode)
        ? (primaryPhoneCountryCode as CountryCode)
        : undefined,
    );

    return {
      ...compositeData,
      primaryPhoneNumber: number,
      primaryPhoneCallingCode: `+${countryCallingCode}`,
    };
  } catch {
    const defaultValue = field.defaultValue as
      | { primaryPhoneCallingCode?: unknown }
      | null
      | undefined;

    return {
      ...compositeData,
      primaryPhoneNumber,
      primaryPhoneCallingCode:
        stripSimpleQuotes(defaultValue?.primaryPhoneCallingCode) || '+1',
    };
  }
};

export const buildRecordFromImportedStructuredRow = ({
  fieldMetadataItems,
  importedStructuredRow,
  spreadsheetImportFields,
  timeZone,
}: {
  importedStructuredRow: ImportedStructuredRow;
  fieldMetadataItems: SpreadsheetImportFieldMetadata[];
  spreadsheetImportFields: readonly RelationConnectField[];
  // Dates without an explicit offset are read in this IANA time zone
  timeZone: string;
}): Record<string, unknown> => {
  const recordToBuild: Record<string, unknown> = {};

  for (const field of fieldMetadataItems) {
    const importedFieldValue = importedStructuredRow[field.name];
    const type = field.type as FieldMetadataType;

    switch (type) {
      case FieldMetadataType.CURRENCY:
      case FieldMetadataType.ADDRESS:
      case FieldMetadataType.RICH_TEXT:
      case FieldMetadataType.EMAILS:
      case FieldMetadataType.FULL_NAME:
      case FieldMetadataType.LINKS: {
        const compositeData = buildCompositeFieldRecord(
          field,
          importedStructuredRow,
          type === FieldMetadataType.LINKS
            ? {
                ...COMPOSITE_FIELD_TRANSFORM_CONFIGS[FieldMetadataType.LINKS],
                primaryLinkUrl: getLinkUrlNormalizer(
                  getSpreadsheetImportLinksVariant(field),
                ),
              }
            : (COMPOSITE_FIELD_TRANSFORM_CONFIGS[type] ?? {}),
        );

        if (isDefined(compositeData)) {
          recordToBuild[field.name] = compositeData;
        }
        break;
      }
      case FieldMetadataType.PHONES: {
        const phonesData = buildPhonesFieldRecord(field, importedStructuredRow);

        if (isDefined(phonesData)) {
          recordToBuild[field.name] = phonesData;
        }
        break;
      }
      case FieldMetadataType.BOOLEAN:
        if (isDefined(importedFieldValue)) {
          recordToBuild[field.name] =
            importedFieldValue === 'true' || importedFieldValue === true;
        }
        break;
      case FieldMetadataType.NUMBER:
      case FieldMetadataType.NUMERIC:
        if (isDefined(importedFieldValue)) {
          recordToBuild[field.name] = Number(importedFieldValue);
        }
        break;
      case FieldMetadataType.RELATION: {
        const relationConnectFieldValue = buildRelationConnectFieldRecord(
          field,
          importedStructuredRow,
          spreadsheetImportFields,
        );

        if (isDefined(relationConnectFieldValue)) {
          recordToBuild[field.name] = relationConnectFieldValue;
        }
        break;
      }
      case FieldMetadataType.ACTOR:
        recordToBuild[field.name] = { source: 'IMPORT', context: {} };
        break;
      case FieldMetadataType.ARRAY:
      case FieldMetadataType.MULTI_SELECT:
        if (isDefined(importedFieldValue)) {
          recordToBuild[field.name] =
            STRING_ARRAY_JSON_SCHEMA.parse(importedFieldValue);
        }
        break;
      case FieldMetadataType.RAW_JSON:
        if (typeof importedFieldValue === 'string') {
          try {
            recordToBuild[field.name] = JSON.parse(importedFieldValue);
          } catch {
            break;
          }
        }
        break;
      case FieldMetadataType.UUID:
        if (isNonEmptyString(importedFieldValue)) {
          recordToBuild[field.name] = importedFieldValue;
        }
        break;
      case FieldMetadataType.DATE:
        if (isNonEmptyString(importedFieldValue)) {
          recordToBuild[field.name] = parseSpreadsheetImportPlainDate(
            importedFieldValue,
            timeZone,
          );
        }
        break;
      case FieldMetadataType.DATE_TIME:
        if (isNonEmptyString(importedFieldValue)) {
          recordToBuild[field.name] = parseSpreadsheetImportDateTime(
            importedFieldValue,
            timeZone,
          ).toISOString();
        }
        break;
      case FieldMetadataType.SELECT:
      case FieldMetadataType.RATING:
      case FieldMetadataType.TEXT:
        if (isDefined(importedFieldValue)) {
          recordToBuild[field.name] = importedFieldValue;
        }
        break;
      case FieldMetadataType.FILES:
      case FieldMetadataType.MORPH_RELATION:
      case FieldMetadataType.POSITION:
      case FieldMetadataType.TS_VECTOR:
        break;
      default:
        assertUnreachable(type);
    }
  }

  return recordToBuild;
};
