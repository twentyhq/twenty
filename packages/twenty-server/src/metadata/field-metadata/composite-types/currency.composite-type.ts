import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';
import { FieldMetadataInterface } from 'src/metadata/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

export const currencyFields = (
  fieldMetadata?: FieldMetadataInterface,
): FieldMetadataInterface[] => {
  return [
    {
      id: 'amountMicros',
      type: FieldMetadataType.NUMERIC,
      objectMetadataId: FieldMetadataType.CURRENCY.toString(),
      name: 'amountMicros',
      label: 'AmountMicros',
      targetColumnMap: {
        value: fieldMetadata
          ? `${fieldMetadata.name}AmountMicros`
          : 'amountMicros',
      },
      isNullable: true,
    } satisfies FieldMetadataInterface,
    {
      id: 'currencyCode',
      type: FieldMetadataType.TEXT,
      objectMetadataId: FieldMetadataType.CURRENCY.toString(),
      name: 'currencyCode',
      label: 'Currency Code',
      targetColumnMap: {
        value: fieldMetadata
          ? `${fieldMetadata.name}CurrencyCode`
          : 'currencyCode',
      },
      isNullable: true,
    } satisfies FieldMetadataInterface,
  ];
};

export const currencyObjectDefinition = {
  id: FieldMetadataType.CURRENCY.toString(),
  nameSingular: 'currency',
  namePlural: 'currency',
  labelSingular: 'Currency',
  labelPlural: 'Currency',
  targetTableName: '',
  fields: currencyFields(),
  fromRelations: [],
  toRelations: [],
} satisfies ObjectMetadataInterface;

export type CurrencyMetadata = {
  amountMicros: number;
  currencyCode: string;
}