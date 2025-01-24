import { FieldMetadataType } from 'twenty-shared';

import {
  FieldMetadataSettings,
  NumberDataType,
} from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

export const mapUdtNameToFieldType = (udtName: string): FieldMetadataType => {
  switch (udtName) {
    case 'uuid':
      return FieldMetadataType.UUID;
    case 'varchar':
    case 'text':
      return FieldMetadataType.TEXT;
    case 'bool':
      return FieldMetadataType.BOOLEAN;
    case 'timestamp':
    case 'timestamptz':
      return FieldMetadataType.DATE_TIME;
    case 'integer':
    case 'int2':
    case 'int4':
    case 'int8':
    case 'bigint':
      return FieldMetadataType.NUMBER;
    default:
      return FieldMetadataType.TEXT;
  }
};

export const mapUdtNameToFieldSettings = (
  udtName: string,
): FieldMetadataSettings<FieldMetadataType> | undefined => {
  switch (udtName) {
    case 'integer':
    case 'int2':
    case 'int4':
      return {
        dataType: NumberDataType.INT,
      } satisfies FieldMetadataSettings<FieldMetadataType.NUMBER>;
    case 'int8':
    case 'bigint':
      return {
        dataType: NumberDataType.BIGINT,
      } satisfies FieldMetadataSettings<FieldMetadataType.NUMBER>;
    default:
      return undefined;
  }
};
