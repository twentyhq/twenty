import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';

export const fieldNumber = {
  name: 'fieldNumber',
  type: FieldMetadataType.NUMBER,
  targetColumnMap: { value: 'fieldNumber' },
};

export const fieldString = {
  name: 'fieldString',
  type: FieldMetadataType.TEXT,
  targetColumnMap: { value: 'fieldString' },
};

export const fieldLink = {
  name: 'fieldLink',
  type: FieldMetadataType.LINK,
  targetColumnMap: { label: 'fieldLinkLabel', url: 'fieldLinkUrl' },
};

export const fieldCurrency = {
  name: 'fieldCurrency',
  type: FieldMetadataType.CURRENCY,
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
