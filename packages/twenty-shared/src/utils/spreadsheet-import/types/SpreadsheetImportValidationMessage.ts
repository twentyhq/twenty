export type SpreadsheetImportValidationMessageCode =
  | 'NOT_A_NUMBER'
  | 'INVALID_UUID'
  | 'INVALID_EMAIL'
  | 'INVALID_EMAIL_ARRAY'
  | 'INVALID_URL'
  | 'INVALID_LINK_ARRAY'
  | 'INVALID_DATE_TIME'
  | 'INVALID_DATE'
  | 'INVALID_PHONE_NUMBER'
  | 'INVALID_CALLING_CODE'
  | 'INVALID_COUNTRY_CODE'
  | 'INVALID_PHONE_ARRAY'
  | 'INVALID_JSON'
  | 'INVALID_ARRAY'
  | 'INVALID_RATING'
  | 'DUPLICATE_IN_IMPORT';

// Messages stay untranslated descriptors so the browser and the server can
// each render them in the requester's locale with their own catalogs.
export type SpreadsheetImportValidationMessage = {
  code: SpreadsheetImportValidationMessageCode;
  fieldName: string;
};
