import {
  type CompositeFieldSubFieldName,
  type FilterableAndTSVectorFieldType,
  type PartialFieldMetadataItem,
  type ViewFilterOperand,
} from '@/types';

// Minimal field shape the GraphQL dispatcher needs. Defined as a Pick so any
// field-like object (FieldMetadataItem on the frontend, FlatFieldMetadata on
// the server) satisfies it structurally without callers having to remap.
export type HydratedFilterField = Pick<
  PartialFieldMetadataItem,
  'id' | 'name' | 'type' | 'label'
>;

// Resolved counterpart of RecordFilter: `field` and `targetField` carry the
// looked-up field metadata so the dispatcher can do pure data transformation.
export type HydratedRecordFilter = {
  id?: string;
  field: HydratedFilterField;
  targetField?: HydratedFilterField;
  value: string;
  type: FilterableAndTSVectorFieldType;
  recordFilterGroupId?: string | null;
  operand: ViewFilterOperand;
  subFieldName?: CompositeFieldSubFieldName | null | undefined;
};
