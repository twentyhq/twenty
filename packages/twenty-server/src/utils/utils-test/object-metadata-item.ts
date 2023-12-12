import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';

export const fieldNumber = {
  name: 'fieldNumber',
  type: FieldMetadataType.NUMBER,
  isNullable: false,
  defaultValue: null,
  targetColumnMap: { value: 'fieldNumber' },
};

export const fieldString = {
  name: 'fieldString',
  type: FieldMetadataType.TEXT,
  isNullable: true,
  defaultValue: null,
  targetColumnMap: { value: 'fieldString' },
};

export const fieldLink = {
  name: 'fieldLink',
  type: FieldMetadataType.LINK,
  isNullable: false,
  defaultValue: { label: '', url: '' },
  targetColumnMap: { label: 'fieldLinkLabel', url: 'fieldLinkUrl' },
};

export const fieldCurrency = {
  name: 'fieldCurrency',
  type: FieldMetadataType.CURRENCY,
  isNullable: true,
  defaultValue: null,
  targetColumnMap: {
    amountMicros: 'fieldCurrencyAmountMicros',
    currencyCode: 'fieldCurrencyCurrencyCode',
  },
};

export const objectMetadataItem: DeepPartial<ObjectMetadataEntity> = {
  targetTableName: 'testingObject',
  nameSingular: 'objectName',
  namePlural: 'objectsName',
  fields: [fieldNumber, fieldString, fieldLink, fieldCurrency],
};
