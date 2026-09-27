import { isDate, isString } from '@sniptt/guards';
import { parsePhoneNumberWithError } from 'libphonenumber-js';

import { RATING_VALUES } from '@/constants/RatingValues';
import { type FieldLinksVariant } from '@/types/FieldMetadataSettings';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { type SpreadsheetImportFieldValidationDefinition } from '@/utils/spreadsheet-import/types/SpreadsheetImportFieldValidationDefinition';
import {
  type SpreadsheetImportValidationMessage,
  type SpreadsheetImportValidationMessageCode,
} from '@/utils/spreadsheet-import/types/SpreadsheetImportValidationMessage';
import { absoluteUrlSchema } from '@/utils/url/absoluteUrlSchema';
import { isValidDomain } from '@/utils/url/isValidDomain';
import { emailSchema } from '@/utils/validation/emailSchema';
import { isDefined } from '@/utils/validation/isDefined';
import { isValidUuid } from '@/utils/validation/isValidUuid';
import { getCountryCodesForCallingCode } from '@/utils/validation/phones-value/getCountryCodesForCallingCode';
import { isValidCountryCode } from '@/utils/validation/phones-value/isValidCountryCode';

type ValidationDefinition =
  SpreadsheetImportFieldValidationDefinition<SpreadsheetImportValidationMessage>;

const buildFunctionValidation = (
  fieldName: string,
  code: SpreadsheetImportValidationMessageCode,
  isValid: (value: string) => boolean,
): ValidationDefinition => ({
  rule: 'function',
  isValid,
  errorMessage: { code, fieldName },
  level: 'error',
});

const isValidPhoneNumber = (value: string) => {
  try {
    return isDefined(
      parsePhoneNumberWithError(value, { defaultCallingCode: '1' }),
    );
  } catch {
    return false;
  }
};

const isValidCallingCode = (value: string) =>
  getCountryCodesForCallingCode(value).length > 0;

const isValidDateValue = (value: string) => {
  const date = new Date(value);

  return isDate(date) && !isNaN(date.getTime());
};

const isParsableJsonArrayEvery = (
  stringifiedValue: string,
  isValidItem: (item: never) => boolean,
) => {
  if (!isDefined(stringifiedValue)) return true;

  try {
    return JSON.parse(stringifiedValue).every(isValidItem);
  } catch {
    return false;
  }
};

export const getSpreadsheetImportFieldValidationDefinitions = (
  type: `${FieldMetadataType}`,
  fieldName: string,
  subFieldKey?: string,
  linksVariant?: FieldLinksVariant,
): ValidationDefinition[] => {
  const isValidLinkUrl = (url: string) =>
    linksVariant === 'domain'
      ? isValidDomain(url)
      : absoluteUrlSchema.safeParse(url).success;

  switch (type) {
    case FieldMetadataType.NUMBER:
      return [
        buildFunctionValidation(
          fieldName,
          'NOT_A_NUMBER',
          (value) => !isNaN(+value),
        ),
      ];
    case FieldMetadataType.UUID:
    case FieldMetadataType.RELATION:
      return [buildFunctionValidation(fieldName, 'INVALID_UUID', isValidUuid)];
    case FieldMetadataType.CURRENCY:
      return subFieldKey === 'amountMicros'
        ? [
            buildFunctionValidation(
              fieldName,
              'NOT_A_NUMBER',
              (value) => !isNaN(+value),
            ),
          ]
        : [];
    case FieldMetadataType.EMAILS:
      switch (subFieldKey) {
        case 'primaryEmail':
          return [
            buildFunctionValidation(
              fieldName,
              'INVALID_EMAIL',
              (email) => emailSchema.safeParse(email).success,
            ),
          ];
        case 'additionalEmails':
          return [
            buildFunctionValidation(
              fieldName,
              'INVALID_EMAIL_ARRAY',
              (stringifiedAdditionalEmails) =>
                isParsableJsonArrayEvery(
                  stringifiedAdditionalEmails,
                  (email: string) => emailSchema.safeParse(email).success,
                ),
            ),
          ];
        default:
          return [];
      }
    case FieldMetadataType.LINKS:
      switch (subFieldKey) {
        case 'primaryLinkUrl':
          return [
            buildFunctionValidation(
              fieldName,
              'INVALID_URL',
              (primaryLinkUrl) =>
                !isDefined(primaryLinkUrl) || isValidLinkUrl(primaryLinkUrl),
            ),
          ];
        case 'secondaryLinks':
          return [
            buildFunctionValidation(
              fieldName,
              'INVALID_LINK_ARRAY',
              (stringifiedSecondaryLinks) =>
                isParsableJsonArrayEvery(
                  stringifiedSecondaryLinks,
                  (link: { url: string }) =>
                    !isDefined(link.url) || isValidLinkUrl(link.url),
                ),
            ),
          ];
        default:
          return [];
      }
    case FieldMetadataType.DATE_TIME:
      return [
        buildFunctionValidation(
          fieldName,
          'INVALID_DATE_TIME',
          isValidDateValue,
        ),
      ];
    case FieldMetadataType.DATE:
      return [
        buildFunctionValidation(fieldName, 'INVALID_DATE', isValidDateValue),
      ];
    case FieldMetadataType.PHONES:
      switch (subFieldKey) {
        case 'primaryPhoneNumber':
          return [
            buildFunctionValidation(
              fieldName,
              'INVALID_PHONE_NUMBER',
              isValidPhoneNumber,
            ),
          ];
        case 'primaryPhoneCallingCode':
          return [
            buildFunctionValidation(
              fieldName,
              'INVALID_CALLING_CODE',
              isValidCallingCode,
            ),
          ];
        case 'primaryPhoneCountryCode':
          return [
            buildFunctionValidation(
              fieldName,
              'INVALID_COUNTRY_CODE',
              isValidCountryCode,
            ),
          ];
        case 'additionalPhones':
          return [
            buildFunctionValidation(
              fieldName,
              'INVALID_PHONE_ARRAY',
              (stringifiedAdditionalPhones) =>
                isParsableJsonArrayEvery(
                  stringifiedAdditionalPhones,
                  (phone: {
                    number: string;
                    callingCode: string;
                    countryCode: string;
                  }) =>
                    isValidPhoneNumber(phone.number) &&
                    isValidCallingCode(phone.callingCode) &&
                    isValidCountryCode(phone.countryCode),
                ),
            ),
          ];
        default:
          return [];
      }
    case FieldMetadataType.RAW_JSON:
      return [
        buildFunctionValidation(fieldName, 'INVALID_JSON', (value) => {
          try {
            JSON.parse(value);
            return true;
          } catch {
            return false;
          }
        }),
      ];
    case FieldMetadataType.ARRAY:
      return [
        buildFunctionValidation(fieldName, 'INVALID_ARRAY', (value) => {
          try {
            const parsedValue = JSON.parse(value);

            return (
              Array.isArray(parsedValue) &&
              parsedValue.every((item: unknown) => isString(item))
            );
          } catch {
            return false;
          }
        }),
      ];
    case FieldMetadataType.RATING:
      return [
        buildFunctionValidation(fieldName, 'INVALID_RATING', (value) =>
          (RATING_VALUES as readonly string[]).includes(value),
        ),
      ];
    default:
      return [];
  }
};
