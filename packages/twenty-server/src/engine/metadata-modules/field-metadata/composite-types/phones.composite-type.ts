import { FieldMetadataType } from 'twenty-shared/types';

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

type PhoneMetadata = {
  number: string;
  countryCode: string;
  callingCode: string;
};

type PrimaryPhoneMetadata<T extends PhoneMetadata = PhoneMetadata> = {
  [Property in keyof PhoneMetadata as `primaryPhone${Capitalize<string & Property>}`]: T[Property];
};

export type PhonesMetadata = PrimaryPhoneMetadata & {
  additionalPhones: Array<PhoneMetadata> | null;
};
