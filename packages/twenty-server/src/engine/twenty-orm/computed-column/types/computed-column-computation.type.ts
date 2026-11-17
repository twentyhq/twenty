import {
  type FieldMetadataComputation,
  type FieldMetadataFilteredRelationComputation,
} from 'twenty-shared/types';

// A filtered relation is a relation, loaded like one: it has no column
export type ComputedColumnComputation = Exclude<
  FieldMetadataComputation,
  FieldMetadataFilteredRelationComputation
>;
