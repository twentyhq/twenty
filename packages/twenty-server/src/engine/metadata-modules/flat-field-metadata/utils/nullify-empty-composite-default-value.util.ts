import {
  FieldMetadataType,
  type FieldMetadataDefaultValueForAnyType,
} from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

import { CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';

import { nullifyEmptyActorDefaultValue } from './nullify-empty-actor-default-value.util';
import { nullifyEmptyAddressDefaultValue } from './nullify-empty-address-default-value.util';
import { nullifyEmptyCurrencyDefaultValue } from './nullify-empty-currency-default-value.util';
import { nullifyEmptyEmailsDefaultValue } from './nullify-empty-emails-default-value.util';
import { nullifyEmptyFullNameDefaultValue } from './nullify-empty-full-name-default-value.util';
import { nullifyEmptyLinksDefaultValue } from './nullify-empty-links-default-value.util';
import { nullifyEmptyPhonesDefaultValue } from './nullify-empty-phones-default-value.util';
import { nullifyEmptyRichTextDefaultValue } from './nullify-empty-rich-text-default-value.util';

export const nullifyEmptyCompositeDefaultValue = ({
  defaultValue,
  fieldType,
}: {
  defaultValue: FieldMetadataDefaultValueForAnyType;
  fieldType: CompositeFieldMetadataType;
}): FieldMetadataDefaultValueForAnyType => {
  switch (fieldType) {
    case FieldMetadataType.PHONES:
      return nullifyEmptyPhonesDefaultValue(defaultValue);
    case FieldMetadataType.EMAILS:
      return nullifyEmptyEmailsDefaultValue(defaultValue);
    case FieldMetadataType.LINKS:
      return nullifyEmptyLinksDefaultValue(defaultValue);
    case FieldMetadataType.ADDRESS:
      return nullifyEmptyAddressDefaultValue(defaultValue);
    case FieldMetadataType.FULL_NAME:
      return nullifyEmptyFullNameDefaultValue(defaultValue);
    case FieldMetadataType.ACTOR:
      return nullifyEmptyActorDefaultValue(defaultValue);
    case FieldMetadataType.CURRENCY:
      return nullifyEmptyCurrencyDefaultValue(defaultValue);
    case FieldMetadataType.RICH_TEXT:
      return nullifyEmptyRichTextDefaultValue(defaultValue);
    default:
      assertUnreachable(fieldType);
  }
};
