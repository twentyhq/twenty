export type FormulaSqlType =
  | 'number'
  | 'text'
  | 'boolean'
  | 'date'
  | 'dateTime'
  | 'textArray'
  | 'record';

// A boolean value is never NULL; every other type can be, unless flagged
export type FormulaSqlValue = {
  sql: string;
  type: FormulaSqlType;
  isNeverNull?: boolean;
  textLiteral?: string;
};
