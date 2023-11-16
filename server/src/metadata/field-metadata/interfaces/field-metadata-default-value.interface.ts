import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

export interface FieldMetadataDefaultValueString {
  value: string;
}
export interface FieldMetadataDefaultValueNumber {
  value: number;
}
export interface FieldMetadataDefaultValueBoolean {
  value: boolean;
}
export interface FieldMetadataDefaultValueDate {
  value: Date;
}

type FieldMetadataScalarDefaultValue =
  | FieldMetadataDefaultValueString
  | FieldMetadataDefaultValueNumber
  | FieldMetadataDefaultValueBoolean
  | FieldMetadataDefaultValueDate;

export type FieldMetadataDynamicDefaultValue =
  | { type: 'uuid' }
  | { type: 'now' };

interface FieldMetadataDefaultValueUrl {
  text: string;
  link: string;
}

interface FieldMetadataDefaultValueMoney {
  amount: number;
  currency: string;
}

type AllFieldMetadataDefaultValueTypes =
  | FieldMetadataScalarDefaultValue
  | FieldMetadataDynamicDefaultValue
  | FieldMetadataDefaultValueUrl
  | FieldMetadataDefaultValueMoney;

type FieldMetadataDefaultValueMapping = {
  [FieldMetadataType.UUID]: FieldMetadataDefaultValueString;
  [FieldMetadataType.TEXT]: FieldMetadataDefaultValueString;
  [FieldMetadataType.PHONE]: FieldMetadataDefaultValueString;
  [FieldMetadataType.EMAIL]: FieldMetadataDefaultValueString;
  [FieldMetadataType.DATE]: FieldMetadataDefaultValueDate;
  [FieldMetadataType.BOOLEAN]: FieldMetadataDefaultValueBoolean;
  [FieldMetadataType.NUMBER]: FieldMetadataDefaultValueNumber;
  [FieldMetadataType.PROBABILITY]: FieldMetadataDefaultValueNumber;
  [FieldMetadataType.ENUM]: FieldMetadataDefaultValueString;
  [FieldMetadataType.URL]: FieldMetadataDefaultValueUrl;
  [FieldMetadataType.MONEY]: FieldMetadataDefaultValueMoney;
};

type DefaultValueByFieldMetadata<T extends FieldMetadataType | 'default'> = [
  T,
] extends [keyof FieldMetadataDefaultValueMapping]
  ? FieldMetadataDefaultValueMapping[T] | null
  : T extends 'default'
  ? AllFieldMetadataDefaultValueTypes | null
  : never;

export type FieldMetadataDefaultValue<
  T extends FieldMetadataType | 'default' = 'default',
> = DefaultValueByFieldMetadata<T>;

type FieldMetadataDefaultValueExtractNestedType<T> = T extends {
  value: infer U;
}
  ? U
  : T extends object
  ? T[keyof T]
  : never;

type FieldMetadataDefaultValueExtractedTypes = {
  [K in keyof FieldMetadataDefaultValueMapping]: FieldMetadataDefaultValueExtractNestedType<
    FieldMetadataDefaultValueMapping[K]
  >;
};

export type FieldMetadataDefaultSerializableValue =
  | FieldMetadataDefaultValueExtractedTypes[keyof FieldMetadataDefaultValueExtractedTypes]
  | FieldMetadataDynamicDefaultValue
  | null;
