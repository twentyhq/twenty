import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

export interface FieldMetadataTargetColumnMapValue {
  value: string;
}

export interface FieldMetadataTargetColumnMapLink {
  label: string;
  url: string;
}

export interface FieldMetadataTargetColumnMapCurrency {
  amountMicros: string;
  currencyCode: string;
}

export interface FieldMetadataTargetColumnMapFullName {
  firstName: string;
  lastName: string;
}

type AllFieldMetadataTypes = {
  [key: string]: string;
};

type FieldMetadataTypeMapping = {
  [FieldMetadataType.LINK]: FieldMetadataTargetColumnMapLink;
  [FieldMetadataType.CURRENCY]: FieldMetadataTargetColumnMapCurrency;
  [FieldMetadataType.FULL_NAME]: FieldMetadataTargetColumnMapFullName;
};

type TypeByFieldMetadata<T extends FieldMetadataType | 'default'> = [
  T,
] extends [keyof FieldMetadataTypeMapping]
  ? FieldMetadataTypeMapping[T]
  : T extends 'default'
    ? AllFieldMetadataTypes
    : FieldMetadataTargetColumnMapValue;

export type FieldMetadataTargetColumnMap<
  T extends FieldMetadataType | 'default' = 'default',
> = TypeByFieldMetadata<T>;
