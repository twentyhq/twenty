import { type DateDisplayFormat } from './FieldMetadataDateSettings';

export type FieldMetadataDateTimeSettings =
  | {
      displayFormat?: DateDisplayFormat.CUSTOM;
      customUnicodeDateFormat: string;
    }
  | {
      displayFormat?: Exclude<DateDisplayFormat, DateDisplayFormat.CUSTOM>;
    };
