import { FieldMetadataType } from 'twenty-shared/types';

import { CountryCallingCode, CountryCode } from 'libphonenumber-js';
import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

export const phonesCompositeType: CompositeType = {
  type: FieldMetadataType.PHONES,
  properties: [
    {
      name: 'primaryPhoneNumber',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
      isIncludedInUniqueConstraint: true,
    },
    {
      name: 'primaryPhoneCountryCode',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
    },
    {
      name: 'primaryPhoneCallingCode',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
    },
    {
      name: 'additionalPhones',
      type: FieldMetadataType.RAW_JSON,
      hidden: false,
      isRequired: false,
    },
  ],
};

export type PhoneMetadata = {
  number: string;
  countryCode: CountryCode;
  callingCode: CountryCallingCode;
};

type PrimaryPhoneMetadata<T extends PhoneMetadata = PhoneMetadata> = {
  [Property in keyof PhoneMetadata as `primaryPhone${Capitalize<string & Property>}`]: T[Property];
};

export type PhonesMetadata = PrimaryPhoneMetadata & {
  additionalPhones: Array<PhoneMetadata> | null;
};
