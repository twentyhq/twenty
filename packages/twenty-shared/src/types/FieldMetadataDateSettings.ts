export enum DateDisplayFormat {
  RELATIVE = 'RELATIVE',
  USER_SETTINGS = 'USER_SETTINGS',
  CUSTOM = 'CUSTOM',
}

export type FieldMetadataDateSettings =
  | {
      displayFormat?: DateDisplayFormat.CUSTOM;
      customUnicodeDateFormat: string;
    }
  | {
      displayFormat?: Exclude<DateDisplayFormat, DateDisplayFormat.CUSTOM>;
    };
