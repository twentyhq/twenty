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
} from 'class-validator';

import { IsQuotedString } from 'src/engine/metadata-modules/field-metadata/validators/is-quoted-string.validator';

export const fieldMetadataDefaultValueFunctionName = {
  UUID: 'uuid',
  NOW: 'now',
} as const;

export class FieldMetadataDefaultValueString {
  @IsQuotedString()
  value: string | null;
}

export class FieldMetadataDefaultValueRawJson {
  @IsJSON()
  value: JSON | null;
}

export class FieldMetadataDefaultValueNumber {
  @IsNumber()
  value: number | null;
}

export class FieldMetadataDefaultValueBoolean {
  @IsBoolean()
  value: boolean | null;
}

export class FieldMetadataDefaultValueStringArray {
  @IsArray()
  @IsQuotedString({ each: true })
  value: string[] | null;
}

export class FieldMetadataDefaultValueDateTime {
  @IsDate()
  value: Date | null;
}

export class FieldMetadataDefaultValueLink {
  @IsQuotedString()
  label: string | null;

  @IsQuotedString()
  url: string | null;
}

export class FieldMetadataDefaultValueCurrency {
  @IsNumberString()
  amountMicros: string | null;

  @IsQuotedString()
  currencyCode: string | null;
}

export class FieldMetadataDefaultValueFullName {
  @IsQuotedString()
  firstName: string | null;

  @IsQuotedString()
  lastName: string | null;
}

export class FieldMetadataDefaultValueUuidFunction {
  @Matches(fieldMetadataDefaultValueFunctionName.UUID)
  @IsNotEmpty()
  @IsString()
  value: typeof fieldMetadataDefaultValueFunctionName.UUID;
}

export class FieldMetadataDefaultValueNowFunction {
  @Matches(fieldMetadataDefaultValueFunctionName.NOW)
  @IsNotEmpty()
  @IsString()
  value: typeof fieldMetadataDefaultValueFunctionName.NOW;
}
