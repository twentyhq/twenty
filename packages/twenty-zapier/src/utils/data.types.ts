import { FieldMetadataType } from 'twenty-shared/types';
export type InputData = { [x: string]: any };

export type FieldOption = {
  id?: string;
  position: number;
  label: string;
  value: string;
  color?: string;
};

export type NodeField = {
  type: FieldMetadataType;
  name: string;
  label: string;
  description: string | null;
  isNullable: boolean;
  defaultValue: object | null;
  options?: FieldOption[] | null;
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
  choices?: Record<string, string>;
};

export type Schema = {
  data: {
    objects: {
      edges: { node: Node }[];
    };
  };
};
