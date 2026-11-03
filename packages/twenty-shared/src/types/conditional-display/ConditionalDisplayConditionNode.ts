import { type RecordFilterGroupLogicalOperator } from '../RecordFilterGroupLogicalOperator';

import { type ConditionalDisplayRecordFilter } from './ConditionalDisplayRecordFilter';
import { type ConditionalDisplaySelectedRecordsMatch } from './ConditionalDisplaySelectedRecordsMatch';

export type ConditionalDisplayConditionNode =
  | {
      kind: 'recordFilter';
      recordFilter: Omit<
        ConditionalDisplayRecordFilter,
        'id' | 'recordFilterGroupId' | 'positionInRecordFilterGroup'
      >;
      selectedRecordsMatch?: ConditionalDisplaySelectedRecordsMatch;
    }
  | {
      kind: 'recordFilterGroup';
      logicalOperator: RecordFilterGroupLogicalOperator;
      children: ConditionalDisplayConditionNode[];
    };
