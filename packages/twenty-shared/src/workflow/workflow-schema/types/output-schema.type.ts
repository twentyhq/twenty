import { type FieldMetadataType } from '@/types/FieldMetadataType';

import {
  type BaseOutputSchemaV2,
  type Leaf,
  type Node,
} from './base-output-schema.type';

export type RecordFieldLeaf = {
  isLeaf: true;
  icon?: string;
  type: FieldMetadataType;
  label: string;
  value: any;
  fieldMetadataId: string;
  isCompositeSubField: boolean;
};

export type RecordFieldNode = {
  isLeaf: false;
  icon?: string;
  type: FieldMetadataType;
  label: string;
  value: RecordFieldNodeValue;
  fieldMetadataId: string;
};

export type RecordFieldNodeValue =
  | RecordOutputSchemaV2
  | Record<string, RecordFieldLeaf>;

export type FieldOutputSchemaV2 = RecordFieldLeaf | RecordFieldNode;

export type RecordOutputSchemaV2 = {
  object: {
    icon?: string;
    label: string;
    objectMetadataId: string;
    isRelationField?: boolean;
    fieldIdName?: string;
  };
  fields: Record<string, FieldOutputSchemaV2>;
  _outputSchemaType: 'RECORD';
};

export type RecordNode = {
  isLeaf: false;
  icon?: string;
  label: string;
  value: RecordOutputSchemaV2;
};

export type FindRecordsOutputSchema = {
  first: RecordNode;
  all: Leaf | undefined;
  totalCount: Leaf;
};

export type IteratorOutputSchema = {
  currentItem: RecordNode | Leaf | Node;
  currentItemIndex: number;
  hasProcessedAllItems: boolean;
};

export type FormFieldLeaf = {
  isLeaf: true;
  type: FieldMetadataType;
  label: string;
  value: unknown;
};

export type FormFieldNode = {
  isLeaf: false;
  label: string;
  value: RecordOutputSchemaV2;
};

export type FormOutputSchema = Record<string, FormFieldLeaf | FormFieldNode>;

export type LinkOutputSchema = {
  link: { isLeaf: true; tab?: string; label?: string };
  _outputSchemaType: 'LINK';
};

export type CodeOutputSchema = LinkOutputSchema | BaseOutputSchemaV2;

export type ManualTriggerOutputSchema =
  | BaseOutputSchemaV2
  | RecordOutputSchemaV2;

export type OutputSchemaV2 =
  | BaseOutputSchemaV2
  | CodeOutputSchema
  | FindRecordsOutputSchema
  | FormOutputSchema
  | RecordOutputSchemaV2
  | ManualTriggerOutputSchema
  | IteratorOutputSchema;

export type VariableSearchResult = {
  variableLabel: string | undefined;
  variablePathLabel: string | undefined;
  variableType?: string;
  fieldMetadataId?: string;
  compositeFieldSubFieldName?: string;
};
