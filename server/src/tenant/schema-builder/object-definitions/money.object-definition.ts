import { ObjectMetadataInterface } from 'src/tenant/schema-builder/interfaces/object-metadata.interface';
import { FieldMetadataInterface } from 'src/tenant/schema-builder/interfaces/field-metadata.interface';

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
      objectMetadataId: FieldMetadataType.MONEY.toString(),
      name: 'amount',
      label: 'Amount',
      targetColumnMap: { value: 'amount' },
      isNullable: true,
    } satisfies FieldMetadataInterface,
    {
      id: 'currency',
      type: FieldMetadataType.TEXT,
      objectMetadataId: FieldMetadataType.MONEY.toString(),
      name: 'currency',
      label: 'Currency',
      targetColumnMap: { value: 'currency' },
    } satisfies FieldMetadataInterface,
  ],
  fromRelations: [],
  toRelations: [],
} satisfies ObjectMetadataInterface;
