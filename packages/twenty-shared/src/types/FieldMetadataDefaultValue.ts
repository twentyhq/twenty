import { type FieldMetadataType } from '@/types/FieldMetadataType';
import { type IsExactly } from '@/types/IsExactly';
import { JsonbProperty } from '@/types/JsonbProperty.type';

import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateIf,
  type ValidationArguments,
  type ValidationOptions,
  registerDecorator,
} from 'class-validator';

const IsQuotedString = (validationOptions?: ValidationOptions) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isQuotedString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate: (value: any) => {
          return typeof value === 'string' && /^'{1}.*'{1}$/.test(value);
        },
        defaultMessage: (args: ValidationArguments) => {
          return `${args.property} must be a quoted string`;
        },
      },
    });
  };
};

export const fieldMetadataDefaultValueFunctionName = {
  UUID: 'uuid',
  NOW: 'now',
} as const;

export type FieldMetadataDefaultValueFunctionNames =
  (typeof fieldMetadataDefaultValueFunctionName)[keyof typeof fieldMetadataDefaultValueFunctionName];

export class FieldMetadataDefaultValueString {
  @ValidateIf((_object, value) => value !== null)
  @IsQuotedString()
  value!: string | null;
}

export class FieldMetadataDefaultValueRawJson {
  @ValidateIf((_object, value) => value !== null)
  @IsObject() // TODO: Should this also allow arrays?
  value!: object | null;
}

export class FieldMetadataDefaultValueRichTextV2 {
  @ValidateIf((_object, value) => value !== null)
  @IsQuotedString()
  blocknote!: string | null;

  @ValidateIf((_object, value) => value !== null)
  @IsQuotedString()
  markdown!: string | null;
}

export class FieldMetadataDefaultValueRichText {
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  value!: string | null;
}

export class FieldMetadataDefaultValueNumber {
  @ValidateIf((_object, value) => value !== null)
  @IsNumber()
  value!: number | null;
}

export class FieldMetadataDefaultValueBoolean {
  @ValidateIf((_object, value) => value !== null)
  @IsBoolean()
  value!: boolean | null;
}

export class FieldMetadataDefaultValueStringArray {
  @ValidateIf((_object, value) => value !== null)
  @IsArray()
  @IsQuotedString({ each: true })
  value!: string[] | null;
}

export class FieldMetadataDefaultValueDateTime {
  @ValidateIf((_object, value) => value !== null)
  @IsDate()
  value!: Date | null;
}

export class FieldMetadataDefaultValueDate {
  @ValidateIf((_object, value) => value !== null)
  @IsDate()
  value!: Date | null;
}

export class FieldMetadataDefaultValueCurrency {
  @ValidateIf((_object, value) => value !== null)
  @IsNumberString()
  amountMicros!: string | null;

  @ValidateIf((_object, value) => value !== null)
  @IsQuotedString()
  currencyCode!: string | null;
}

export class FieldMetadataDefaultValueFullName {
  @ValidateIf((_object, value) => value !== null)
  @IsQuotedString()
  firstName!: string | null;

  @ValidateIf((_object, value) => value !== null)
  @IsQuotedString()
  lastName!: string | null;
}

export class FieldMetadataDefaultValueUuidFunction {
  @Matches(fieldMetadataDefaultValueFunctionName.UUID)
  @IsNotEmpty()
  value!: typeof fieldMetadataDefaultValueFunctionName.UUID;
}

export class FieldMetadataDefaultValueNowFunction {
  @Matches(fieldMetadataDefaultValueFunctionName.NOW)
  @IsNotEmpty()
  value!: typeof fieldMetadataDefaultValueFunctionName.NOW;
}

export class FieldMetadataDefaultValueAddress {
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  addressStreet1!: string | null;

  @ValidateIf((_object, value) => value !== null)
  @IsString()
  addressStreet2!: string | null;

  @ValidateIf((_object, value) => value !== null)
  @IsString()
  addressCity!: string | null;

  @ValidateIf((_object, value) => value !== null)
  @IsString()
  addressPostcode!: string | null;

  @ValidateIf((_object, value) => value !== null)
  @IsString()
  addressState!: string | null;

  @ValidateIf((_object, value) => value !== null)
  @IsString()
  addressCountry!: string | null;

  @ValidateIf((_object, value) => value !== null)
  @IsNumber()
  addressLat!: number | null;

  @ValidateIf((_object, value) => value !== null)
  @IsNumber()
  addressLng!: number | null;
}

class LinkMetadata {
  @IsString()
  label!: string;

  @IsString()
  url!: string;
}

export class FieldMetadataDefaultValueLinks {
  @ValidateIf((_object, value) => value !== null)
  @IsQuotedString()
  primaryLinkLabel!: string | null;

  @ValidateIf((_object, value) => value !== null)
  @IsQuotedString()
  primaryLinkUrl!: string | null;

  @ValidateIf((_object, value) => value !== null)
  @IsArray()
  secondaryLinks!: LinkMetadata[] | null;
}

export class FieldMetadataDefaultActor {
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  source!: string;

  @ValidateIf((_object, value) => value !== null)
  @IsOptional()
  @IsUUID()
  workspaceMemberId?: string | null;

  @ValidateIf((_object, value) => value !== null)
  @IsString()
  name!: string;
}

export class FieldMetadataDefaultValueEmails {
  @ValidateIf((_object, value) => value !== null)
  @IsQuotedString()
  primaryEmail!: string | null;

  @ValidateIf((_object, value) => value !== null)
  @IsObject()
  additionalEmails!: object | null;
}

export class FieldMetadataDefaultValuePhones {
  @ValidateIf((_object, value) => value !== null)
  @IsQuotedString()
  primaryPhoneNumber!: string | null;

  @ValidateIf((_object, value) => value !== null)
  @IsQuotedString()
  primaryPhoneCountryCode!: string | null;

  @ValidateIf((_object, value) => value !== null)
  @IsQuotedString()
  primaryPhoneCallingCode!: string | null;

  @ValidateIf((_object, value) => value !== null)
  @IsObject()
  additionalPhones!: object | null;
}

export class FieldMetadataDefaultArray {
  @ValidateIf((_object, value) => value !== null)
  @IsArray()
  value!: string[] | null;
}

type ExtractValueType<T> = T extends { value: infer V } ? V : T;

type UnionOfValues<T> = T[keyof T];

type FieldMetadataDefaultValueMapping = {
  [FieldMetadataType.UUID]: JsonbProperty<
    FieldMetadataDefaultValueString | FieldMetadataDefaultValueUuidFunction
  >;
  [FieldMetadataType.TEXT]: JsonbProperty<FieldMetadataDefaultValueString>;
  [FieldMetadataType.PHONES]: JsonbProperty<FieldMetadataDefaultValuePhones>;
  [FieldMetadataType.EMAILS]: JsonbProperty<FieldMetadataDefaultValueEmails>;
  [FieldMetadataType.DATE_TIME]: JsonbProperty<
    FieldMetadataDefaultValueDateTime | FieldMetadataDefaultValueNowFunction
  >;
  [FieldMetadataType.DATE]: JsonbProperty<
    FieldMetadataDefaultValueDateTime | FieldMetadataDefaultValueNowFunction
  >;
  [FieldMetadataType.BOOLEAN]: JsonbProperty<FieldMetadataDefaultValueBoolean>;
  [FieldMetadataType.NUMBER]: JsonbProperty<FieldMetadataDefaultValueNumber>;
  [FieldMetadataType.POSITION]: JsonbProperty<FieldMetadataDefaultValueNumber>;
  [FieldMetadataType.NUMERIC]: JsonbProperty<FieldMetadataDefaultValueString>;
  [FieldMetadataType.LINKS]: JsonbProperty<FieldMetadataDefaultValueLinks>;
  [FieldMetadataType.CURRENCY]: JsonbProperty<FieldMetadataDefaultValueCurrency>;
  [FieldMetadataType.FULL_NAME]: JsonbProperty<FieldMetadataDefaultValueFullName>;
  [FieldMetadataType.ADDRESS]: JsonbProperty<FieldMetadataDefaultValueAddress>;
  [FieldMetadataType.RATING]: JsonbProperty<FieldMetadataDefaultValueString>;
  [FieldMetadataType.SELECT]: JsonbProperty<FieldMetadataDefaultValueString>;
  [FieldMetadataType.MULTI_SELECT]: JsonbProperty<FieldMetadataDefaultValueStringArray>;
  [FieldMetadataType.RAW_JSON]: JsonbProperty<FieldMetadataDefaultValueRawJson>;
  [FieldMetadataType.RICH_TEXT]: JsonbProperty<FieldMetadataDefaultValueRichText>;
  [FieldMetadataType.ACTOR]: JsonbProperty<FieldMetadataDefaultActor>;
  [FieldMetadataType.ARRAY]: JsonbProperty<FieldMetadataDefaultArray>;
};

export type FieldMetadataClassValidation =
  UnionOfValues<FieldMetadataDefaultValueMapping>;

export type FieldMetadataFunctionDefaultValue = ExtractValueType<
  FieldMetadataDefaultValueUuidFunction | FieldMetadataDefaultValueNowFunction
>;

export type FieldMetadataDefaultValueForType<
  T extends keyof FieldMetadataDefaultValueMapping,
> = ExtractValueType<FieldMetadataDefaultValueMapping[T]> | null;

export type FieldMetadataDefaultValueForAnyType = ExtractValueType<
  UnionOfValues<FieldMetadataDefaultValueMapping>
> | null;

export type FieldMetadataDefaultValue<
  T extends FieldMetadataType = FieldMetadataType,
> =
  IsExactly<T, FieldMetadataType> extends true
    ?
        | null
        | FieldMetadataDefaultValueMapping[keyof FieldMetadataDefaultValueMapping]
    : T extends keyof FieldMetadataDefaultValueMapping
      ? FieldMetadataDefaultValueForType<T>
      : never | null;

type FieldMetadataDefaultValueExtractedTypes = {
  [K in keyof FieldMetadataDefaultValueMapping]: ExtractValueType<
    FieldMetadataDefaultValueMapping[K]
  >;
};

export type FieldMetadataDefaultSerializableValue =
  | FieldMetadataDefaultValueExtractedTypes[keyof FieldMetadataDefaultValueExtractedTypes]
  | null;
