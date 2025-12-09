import { type MessageDescriptor } from '@lingui/core';
import { type ViewFilterOperand } from 'twenty-shared/types';

import { type AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { type ViewOpenRecordInType } from 'src/engine/metadata-modules/view/types/view-open-record-in-type.type';

export interface ViewDefinition {
  id?: string;
  name: string | MessageDescriptor;
  objectMetadataId: string;
  type: string;
  key: string | null;
  position: number;
  applicationId: string;
  universalIdentifier: string;
  icon?: string;
  isCustom?: boolean;
  openRecordIn?: ViewOpenRecordInType;
  kanbanAggregateOperation?: AggregateOperations;
  kanbanAggregateOperationFieldMetadataId?: string;
  mainGroupByFieldMetadataId?: string;
  calendarFieldMetadataId?: string;
  calendarLayout?: string;
  fields?: {
    universalIdentifier: string;
    fieldMetadataId: string;
    position: number;
    isVisible: boolean;
    size: number;
    aggregateOperation?: AggregateOperations;
  }[];
  filters?: {
    universalIdentifier: string;
    fieldMetadataId: string;
    displayValue: string;
    operand: ViewFilterOperand;
    value: string;
  }[];
  groups?: {
    universalIdentifier: string;
    fieldMetadataId: string;
    isVisible: boolean;
    fieldValue: string;
    position: number;
  }[];
}
