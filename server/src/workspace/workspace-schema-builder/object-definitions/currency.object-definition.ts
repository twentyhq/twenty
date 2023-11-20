import { ObjectMetadataInterface } from 'src/workspace/workspace-schema-builder/interfaces/object-metadata.interface';
import { FieldMetadataInterface } from 'src/workspace/workspace-schema-builder/interfaces/field-metadata.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

export const currencyObjectDefinition = {
  id: FieldMetadataType.CURRENCY.toString(),
  nameSingular: 'currency',
  namePlural: 'currency',
  labelSingular: 'Currency',
  labelPlural: 'Currency',
  targetTableName: '',
  fields: [
    {
      id: 'amountMicros',
      type: FieldMetadataType.NUMBER,
      objectMetadataId: FieldMetadataType.CURRENCY.toString(),
      name: 'amountMicros',
      label: 'AmountMicros',
      targetColumnMap: { value: 'amountMicros' },
      isNullable: true,
    } satisfies FieldMetadataInterface,
    {
      id: 'currencyCode',
      type: FieldMetadataType.TEXT,
      objectMetadataId: FieldMetadataType.CURRENCY.toString(),
      name: 'currencyCode',
      label: 'Currency Code',
      targetColumnMap: { value: 'currencyCode' },
      isNullable: true,
    } satisfies FieldMetadataInterface,
  ],
  fromRelations: [],
  toRelations: [],
} satisfies ObjectMetadataInterface;
