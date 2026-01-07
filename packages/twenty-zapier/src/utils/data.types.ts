import { type FieldMetadataType } from '../types/FieldMetadataType';

export type InputData = { [x: string]: any };

export type NodeField = {
  type: FieldMetadataType;
  name: string;
  label: string;
  description: string | null;
  isNullable: boolean;
  defaultValue: boolean | object | null;
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

export type Schema = {
  data: {
    objects: {
      edges: { node: Node }[];
    };
  };
};
