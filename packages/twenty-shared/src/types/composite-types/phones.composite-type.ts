import { type CountryCode } from 'libphonenumber-js';
import { type CompositeType } from '../composite-types/composite-type.interface';
import { FieldMetadataType } from '../FieldMetadataType';
import { PhoneType } from '../PhoneType';

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
      isIncludedInUniqueConstraint: true,
    },
    {
      name: 'primaryPhoneCallingCode',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
      isIncludedInUniqueConstraint: true,
    },
    {
      name: 'primaryPhoneType',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
    },
    {
      name: 'primaryPhoneExtension',
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
  phoneType?: PhoneType | null;
  extension?: string | null;
};

type PrimaryPhoneMetadata<
  T extends AdditionalPhoneMetadata = AdditionalPhoneMetadata,
> = {
  [Property in keyof AdditionalPhoneMetadata as `primaryPhone${Capitalize<string & Property>}`]: T[Property];
};

export type PhonesMetadata = PrimaryPhoneMetadata & {
  primaryPhoneType?: PhoneType | null;
  primaryPhoneExtension?: string | null;
  additionalPhones: Array<AdditionalPhoneMetadata> | null;
};
