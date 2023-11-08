import { ObjectMetadataInterface } from 'src/tenant/schema-builder/interfaces/object-metadata.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

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
      objectId: FieldMetadataType.MONEY.toString(),
      name: 'amount',
      label: 'Amount',
      targetColumnMap: { value: 'amount' },
      isNullable: true,
    },
    {
      id: 'currency',
      type: FieldMetadataType.TEXT,
      objectId: FieldMetadataType.MONEY.toString(),
      name: 'currency',
      label: 'Currency',
      targetColumnMap: { value: 'currency' },
    },
  ],
  fromRelations: [],
  toRelations: [],
} as ObjectMetadataInterface;
