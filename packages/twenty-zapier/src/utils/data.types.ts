import { type FieldMetadataType } from 'twenty-shared/types';

export type InputData = { [x: string]: any };

export type NodeFieldOption = {
  value: string;
  label: string;
};

export type NodeField = {
  type: FieldMetadataType;
  name: string;
  label: string;
  description: string | null;
  isNullable: boolean;
  defaultValue: boolean | object | null;
  list?: boolean;
  placeholder?: string;
  options?: NodeFieldOption[] | null;
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
  choices?: { [value: string]: string };
};

export type Schema = {
  data: {
    objects: {
      edges: { node: Node }[];
    };
  };
};
