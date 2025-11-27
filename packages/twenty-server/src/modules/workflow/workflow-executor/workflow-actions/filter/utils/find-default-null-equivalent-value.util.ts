import { FieldMetadataType } from 'twenty-shared/types';

import {
  DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE,
  DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE,
} from 'src/engine/api/common/common-args-processors/data-arg-processor/constants/null-equivalent-values.constant';
import { isNullEquivalentArrayFieldValue } from 'src/engine/api/common/common-args-processors/data-arg-processor/utils/is-null-equivalent-array-field-value.util';
import { isNullEquivalentTextFieldValue } from 'src/engine/api/common/common-args-processors/data-arg-processor/utils/is-null-equivalent-text-field-value.util';

export const findDefaultNullEquivalentValue = ({
  value,
  fieldMetadataType,
  key,
}: {
  value: unknown;
  fieldMetadataType: string;
  key?: string;
}) => {
  switch (fieldMetadataType) {
    case FieldMetadataType.TEXT:
      return isNullEquivalentTextFieldValue(value)
        ? DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE
        : undefined;
    case FieldMetadataType.MULTI_SELECT:
    case FieldMetadataType.ARRAY:
      return isNullEquivalentArrayFieldValue(value)
        ? DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE
        : undefined;
    case FieldMetadataType.ACTOR: {
      switch (key) {
        case 'name':
          return isNullEquivalentTextFieldValue(value)
            ? DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE
            : undefined;
        default:
          return undefined;
      }
    }
    case FieldMetadataType.ADDRESS: {
      switch (key) {
        case 'addressStreet1':
          return isNullEquivalentTextFieldValue(value)
            ? DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE
            : undefined;
        case 'addressStreet2':
          return isNullEquivalentTextFieldValue(value)
            ? DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE
            : undefined;
        case 'addressCity':
          return isNullEquivalentTextFieldValue(value)
            ? DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE
            : undefined;
        case 'addressState':
          return isNullEquivalentTextFieldValue(value)
            ? DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE
            : undefined;
        case 'addressPostcode':
          return isNullEquivalentTextFieldValue(value)
            ? DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE
            : undefined;
        case 'addressCountry':
          return isNullEquivalentTextFieldValue(value)
            ? DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE
            : undefined;
        default:
          return undefined;
      }
    }
    case FieldMetadataType.EMAILS: {
      switch (key) {
        case 'primaryEmail':
          return isNullEquivalentTextFieldValue(value)
            ? DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE
            : undefined;
        case 'additionalEmails':
          return isNullEquivalentArrayFieldValue(value)
            ? DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE
            : undefined;
        default:
          return undefined;
      }
    }
    case FieldMetadataType.LINKS: {
      switch (key) {
        case 'primaryLinkUrl':
          return isNullEquivalentTextFieldValue(value)
            ? DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE
            : undefined;
        case 'primaryLinkLabel':
          return isNullEquivalentTextFieldValue(value)
            ? DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE
            : undefined;
        case 'secondaryLinks':
          return isNullEquivalentArrayFieldValue(value)
            ? DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE
            : undefined;

        default:
          return undefined;
      }
    }
    case FieldMetadataType.PHONES: {
      switch (key) {
        case 'primaryPhoneNumber':
          return isNullEquivalentTextFieldValue(value)
            ? DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE
            : undefined;
        case 'primaryPhoneCountryCode':
          return isNullEquivalentTextFieldValue(value)
            ? DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE
            : undefined;
        case 'primaryPhoneCallingCode':
          return isNullEquivalentTextFieldValue(value)
            ? DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE
            : undefined;
        case 'additionalPhones':
          return isNullEquivalentArrayFieldValue(value)
            ? DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE
            : undefined;
        default:
          return undefined;
      }
    }
    case FieldMetadataType.RICH_TEXT_V2: {
      switch (key) {
        case 'markdown':
          return isNullEquivalentTextFieldValue(value)
            ? DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE
            : undefined;
        default:
          return undefined;
      }
    }
    case FieldMetadataType.FULL_NAME: {
      switch (key) {
        case 'firstName':
          return isNullEquivalentTextFieldValue(value)
            ? DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE
            : undefined;
        case 'lastName':
          return isNullEquivalentTextFieldValue(value)
            ? DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE
            : undefined;
        default:
          return undefined;
      }
    }
  }

  return undefined;
};
