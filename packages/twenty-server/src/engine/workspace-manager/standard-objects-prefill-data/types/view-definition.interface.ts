import { AGGREGATE_OPERATIONS } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';

export interface ViewDefinition {
  id?: string;
  name: string;
  objectMetadataId: string;
  type: string;
  key: string | null;
  position: number;
  icon?: string;
  kanbanFieldMetadataId?: string;
  kanbanAggregateOperation?: AGGREGATE_OPERATIONS;
  kanbanAggregateOperationFieldMetadataId?: string;
  fields?: {
    fieldMetadataId: string;
    position: number;
    isVisible: boolean;
    size: number;
    aggregateOperation?: AGGREGATE_OPERATIONS;
  }[];
  filters?: {
    fieldMetadataId: string;
    displayValue: string;
    operand: string;
    value: string;
  }[];
  groups?: {
    fieldMetadataId: string;
    isVisible: boolean;
    fieldValue: string;
    position: number;
  }[];
}
