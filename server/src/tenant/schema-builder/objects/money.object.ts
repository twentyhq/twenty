import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { IObjectMetadata } from 'src/tenant/schema-builder/metadata/object.metadata';

export const moneyObjectDefinition = {
  id: FieldMetadataType.MONEY.toString(),
  nameSingular: 'Money',
  namePlural: 'Money',
  labelSingular: 'Money',
  labelPlural: 'Money',
  targetTableName: 'money',
  fields: [
    {
      id: 'amount',
      type: FieldMetadataType.NUMBER,
      name: 'amount',
      label: 'Amount',
      targetColumnMap: { value: 'amount' },
    },
    {
      id: 'currency',
      type: FieldMetadataType.TEXT,
      name: 'currency',
      label: 'Currency',
      targetColumnMap: { value: 'currency' },
    },
  ],
} as IObjectMetadata;
