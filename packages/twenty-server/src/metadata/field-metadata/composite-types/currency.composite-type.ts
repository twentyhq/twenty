import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';
import { FieldMetadataInterface } from 'src/metadata/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { generateTargetColumnMap } from 'src/metadata/field-metadata/utils/generate-target-column-map.util';

export const currencyFields = (
  fieldMetadata?: FieldMetadataInterface,
): FieldMetadataInterface[] => {
  const inferedFieldMetadata = fieldMetadata as
    | FieldMetadataInterface<FieldMetadataType.CURRENCY>
    | undefined;
  const targetColumnMap = inferedFieldMetadata
    ? generateTargetColumnMap(
        inferedFieldMetadata.type,
        inferedFieldMetadata.isCustom ?? false,
        inferedFieldMetadata.name,
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
      ...(inferedFieldMetadata
        ? {
            defaultValue: {
              value: inferedFieldMetadata.defaultValue?.amountMicros ?? null,
            },
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
      ...(inferedFieldMetadata
        ? {
            defaultValue: {
              value: inferedFieldMetadata.defaultValue?.currencyCode ?? null,
            },
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
} satisfies ObjectMetadataInterface;

export type CurrencyMetadata = {
  amountMicros: number;
  currencyCode: string;
};
