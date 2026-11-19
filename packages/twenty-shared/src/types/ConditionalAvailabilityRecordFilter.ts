import { type CompositeFieldSubFieldName } from './CompositeFieldSubFieldNameType';
import { type RecordFilterOperand } from './RecordFilterOperand';

export type ConditionalAvailabilityRecordFilter = {
  fieldMetadataUniversalIdentifier: string;
  subFieldName: CompositeFieldSubFieldName | null;
  operand: RecordFilterOperand;
  value: string;
};
