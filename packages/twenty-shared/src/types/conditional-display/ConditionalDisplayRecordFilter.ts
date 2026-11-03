import { type SerializedRelation } from '../SerializedRelation';
import { type ViewFilterOperand } from '../ViewFilterOperand';

import { type ConditionalDisplayContextKey } from './ConditionalDisplayContextKey';

export type ConditionalDisplayRecordFilter = {
  id: string;
  fieldMetadataId?: SerializedRelation | null;
  contextKey?: ConditionalDisplayContextKey | null;
  subFieldName?: string | null;
  relationTargetFieldMetadataId?: SerializedRelation | null;
  operand: ViewFilterOperand;
  value?: string | null;
  recordFilterGroupId?: string | null;
  positionInRecordFilterGroup?: number | null;
};
