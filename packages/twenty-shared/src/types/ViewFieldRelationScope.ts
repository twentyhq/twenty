import { type AggregateOperations } from './AggregateOperations';
import { type FormatRecordSerializedRelationProperties } from './FormatRecordSerializedRelationProperties';
import { type SerializedRelation } from './SerializedRelation';
import { type ViewFilterGroupLogicalOperator } from './ViewFilterGroupLogicalOperator';
import { type ViewFilterOperand } from './ViewFilterOperand';
import { type ViewFilterValue } from './ViewFilterValue';
import { type ViewSortDirection } from './ViewSortDirection';

// Filter and filter group ids are local to the scope and only used for grouping
export type ViewFieldRelationScopeFilter = {
  id: string;
  fieldMetadataId: SerializedRelation;
  operand: ViewFilterOperand;
  value: ViewFilterValue;
  subFieldName?: string | null;
  relationTargetFieldMetadataId?: SerializedRelation | null;
  filterGroupId?: string | null;
};

export type ViewFieldRelationScopeFilterGroup = {
  id: string;
  parentFilterGroupId?: string | null;
  logicalOperator: ViewFilterGroupLogicalOperator;
};

export type ViewFieldRelationScopeSort = {
  fieldMetadataId: SerializedRelation;
  direction: ViewSortDirection;
  subFieldName?: string | null;
  relationTargetFieldMetadataId?: SerializedRelation | null;
};

export type ViewFieldRelationScope = {
  filters: ViewFieldRelationScopeFilter[];
  filterGroups: ViewFieldRelationScopeFilterGroup[];
  sorts: ViewFieldRelationScopeSort[];
  limit?: number | null;
  aggregateOperation?: AggregateOperations | null;
};

export type UniversalViewFieldRelationScope =
  FormatRecordSerializedRelationProperties<ViewFieldRelationScope>;
