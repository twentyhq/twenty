export type InputData = { [x: string]: any };

export type ObjectData = { id: string } | { [x: string]: any };

export type NodeField = {
  type: FieldMetadataType;
  name: string;
  label: string;
  description: string | null;
  isNullable: boolean;
  defaultValue: object | null;
  list?: boolean;
  placeholder?: string;
};

export type Node = {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  fields: {
    edges: {
      node: NodeField;
    }[];
  };
};

export type InputField = {
  key: string;
  label: string;
  type: string;
  helpText: string | null;
  required: boolean;
  list?: boolean;
  placeholder?: string;
};

export enum FieldMetadataType {
  UUID = 'UUID',
  TEXT = 'TEXT',
  PHONE = 'PHONE',
  PHONES = 'PHONES',
  EMAIL = 'EMAIL',
  EMAILS = 'EMAILS',
  DATE_TIME = 'DATE_TIME',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  NUMBER = 'NUMBER',
  NUMERIC = 'NUMERIC',
  LINK = 'LINK',
  LINKS = 'LINKS',
  CURRENCY = 'CURRENCY',
  FULL_NAME = 'FULL_NAME',
  RATING = 'RATING',
  SELECT = 'SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
  POSITION = 'POSITION',
  ADDRESS = 'ADDRESS',
  RICH_TEXT = 'RICH_TEXT',
  ARRAY = 'ARRAY',

  // Ignored fieldTypes
  RELATION = 'RELATION',
  RAW_JSON = 'RAW_JSON',
  ACTOR = 'ACTOR',
  TS_VECTOR = 'TS_VECTOR',
}

export type Schema = {
  data: {
    objects: {
      edges: { node: Node }[];
    };
  };
};
