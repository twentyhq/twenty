import { type CountryCode } from 'libphonenumber-js';
import { FieldMetadataType } from '../FieldMetadataType';
import { type CompositeType } from '../composite-types/composite-type.interface';

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

export type AdditionalPhoneMetadata = {
  number: string;
  countryCode: CountryCode;
  callingCode: string;
};

type PrimaryPhoneMetadata<
  T extends AdditionalPhoneMetadata = AdditionalPhoneMetadata,
> = {
  [Property in keyof AdditionalPhoneMetadata as `primaryPhone${Capitalize<string & Property>}`]: T[Property];
};

export type PhonesMetadata = PrimaryPhoneMetadata & {
  additionalPhones: Array<AdditionalPhoneMetadata> | null;
};
