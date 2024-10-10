export type InputData = { [x: string]: any };

export type ObjectData = { id: string } | { [x: string]: any };

export type NodeField = {
  type: string;
  name: string;
  label: string;
  description: string | null;
  isNullable: boolean;
  defaultValue: object | null;
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
  RAW_JSON = 'RAW_JSON',
  RICH_TEXT = 'RICH_TEXT',
  ACTOR = 'ACTOR',
  ARRAY = 'ARRAY',
}

export type Schema = {
  data: {
    objects: {
      edges: { node: Node }[];
    };
  };
};
