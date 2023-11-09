import { ObjectMetadataInterface } from 'src/tenant/schema-builder/interfaces/object-metadata.interface';

import { FieldMetadataType } from 'src/database/typeorm/metadata/entities/field-metadata.entity';

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
      isNullable: true,
    },
    {
      id: 'currency',
      type: FieldMetadataType.TEXT,
      name: 'currency',
      label: 'Currency',
      targetColumnMap: { value: 'currency' },
    },
  ],
} as ObjectMetadataInterface;
