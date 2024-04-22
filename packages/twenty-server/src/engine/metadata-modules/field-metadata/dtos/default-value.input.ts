import {
  IsArray,
  IsBoolean,
  IsDate,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';

import { IsQuotedString } from 'src/engine/metadata-modules/field-metadata/validators/is-quoted-string.validator';

export const fieldMetadataDefaultValueFunctionName = {
  UUID: 'uuid',
  NOW: 'now',
} as const;

export type FieldMetadataDefaultValueFunctionNames =
  (typeof fieldMetadataDefaultValueFunctionName)[keyof typeof fieldMetadataDefaultValueFunctionName];

export class FieldMetadataDefaultValueString {
  @ValidateIf((object, value) => value !== null)
  @IsQuotedString()
  value: string | null;
}

export class FieldMetadataDefaultValueRawJson {
  @ValidateIf((object, value) => value !== null)
  @IsJSON()
  value: JSON | null;
}

export class FieldMetadataDefaultValueNumber {
  @ValidateIf((object, value) => value !== null)
  @IsNumber()
  value: number | null;
}

export class FieldMetadataDefaultValueBoolean {
  @ValidateIf((object, value) => value !== null)
  @IsBoolean()
  value: boolean | null;
}

export class FieldMetadataDefaultValueStringArray {
  @ValidateIf((object, value) => value !== null)
  @IsArray()
  @IsQuotedString({ each: true })
  value: string[] | null;
}

export class FieldMetadataDefaultValueDateTime {
  @ValidateIf((object, value) => value !== null)
  @IsDate()
  value: Date | null;
}

export class FieldMetadataDefaultValueDate {
  @ValidateIf((object, value) => value !== null)
  @IsDate()
  value: Date | null;
}

export class FieldMetadataDefaultValueLink {
  @ValidateIf((object, value) => value !== null)
  @IsQuotedString()
  label: string | null;

  @ValidateIf((object, value) => value !== null)
  @IsQuotedString()
  url: string | null;
}

export class FieldMetadataDefaultValueCurrency {
  @ValidateIf((object, value) => value !== null)
  @IsNumberString()
  amountMicros: string | null;

  @ValidateIf((object, value) => value !== null)
  @IsQuotedString()
  currencyCode: string | null;
}

export class FieldMetadataDefaultValueFullName {
  @ValidateIf((object, value) => value !== null)
  @IsQuotedString()
  firstName: string | null;

  @ValidateIf((object, value) => value !== null)
  @IsQuotedString()
  lastName: string | null;
}

export class FieldMetadataDefaultValueUuidFunction {
  @Matches(fieldMetadataDefaultValueFunctionName.UUID)
  @IsNotEmpty()
  value: typeof fieldMetadataDefaultValueFunctionName.UUID;
}

export class FieldMetadataDefaultValueNowFunction {
  @Matches(fieldMetadataDefaultValueFunctionName.NOW)
  @IsNotEmpty()
  value: typeof fieldMetadataDefaultValueFunctionName.NOW;
}
export class FieldMetadataDefaultValueAddress {
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  addressStreet1: string | null;

  @ValidateIf((_object, value) => value !== null)
  @IsString()
  addressStreet2: string | null;

  @ValidateIf((_object, value) => value !== null)
  @IsString()
  addressCity: string | null;

  @ValidateIf((_object, value) => value !== null)
  @IsString()
  addressPostcode: string | null;

  @ValidateIf((_object, value) => value !== null)
  @IsString()
  addressState: string | null;

  @ValidateIf((_object, value) => value !== null)
  @IsString()
  addressCountry: string | null;

  @ValidateIf((_object, value) => value !== null)
  @IsNumber()
  addressLat: number | null;

  @ValidateIf((_object, value) => value !== null)
  @IsNumber()
  addressLng: number | null;
}

export class FieldMetadataDefaultValueFile {
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  fileName: string | null;

  @ValidateIf((_object, value) => value !== null)
  @IsString()
  fileExtension: string | null;

  @ValidateIf((_object, value) => value !== null)
  @IsString()
  storageType: string | null;
}
