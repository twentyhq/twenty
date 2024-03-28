import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';
import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { generateTargetColumnMap } from 'src/engine/metadata-modules/field-metadata/utils/generate-target-column-map.util';

export const currencyFields = (
  fieldMetadata?: FieldMetadataInterface,
): FieldMetadataInterface[] => {
  const inferredFieldMetadata = fieldMetadata as
    | FieldMetadataInterface<FieldMetadataType.CURRENCY>
    | undefined;
  const targetColumnMap = inferredFieldMetadata
    ? generateTargetColumnMap(
        inferredFieldMetadata.type,
        inferredFieldMetadata.isCustom ?? false,
        inferredFieldMetadata.name,
      )
    : {
        amountMicros: 'amountMicros',
        currencyCode: 'currencyCode',
      };

  return [
    {
      id: 'amountMicros',
      type: FieldMetadataType.NUMERIC,
      objectMetadataId: FieldMetadataType.CURRENCY.toString(),
      name: 'amountMicros',
      label: 'AmountMicros',
      targetColumnMap: {
        value: targetColumnMap.amountMicros,
      },
      isNullable: true,
      ...(inferredFieldMetadata
        ? {
            defaultValue:
              inferredFieldMetadata.defaultValue?.amountMicros ?? null,
          }
        : {}),
    } satisfies FieldMetadataInterface<FieldMetadataType.NUMERIC>,
    {
      id: 'currencyCode',
      type: FieldMetadataType.TEXT,
      objectMetadataId: FieldMetadataType.CURRENCY.toString(),
      name: 'currencyCode',
      label: 'Currency Code',
      targetColumnMap: {
        value: targetColumnMap.currencyCode,
      },
      isNullable: true,
      ...(inferredFieldMetadata
        ? {
            defaultValue:
              inferredFieldMetadata.defaultValue?.currencyCode ?? null,
          }
        : {}),
    } satisfies FieldMetadataInterface<FieldMetadataType.TEXT>,
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
  isActive: true,
  isSystem: true,
  isCustom: false,
  isRemote: false,
} satisfies ObjectMetadataInterface;

export type CurrencyMetadata = {
  amountMicros: number;
  currencyCode: string;
};
