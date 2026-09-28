import { type FormatRecordSerializedRelationProperties } from '../FormatRecordSerializedRelationProperties';
import { type SerializedRelation } from '../SerializedRelation';

export type ChartRecordFilter = {
  fieldMetadataId: SerializedRelation;
  operand: string;
  value?: string | null;
  type?: string;
  recordFilterGroupId?: string | null;
  subFieldName?: string | null;
  relationTargetFieldMetadataId?: SerializedRelation | null;
};

export type ChartRecordFilterGroup = {
  id: string;
  logicalOperator: string;
  parentRecordFilterGroupId?: string | null;
};

export type ChartFilter = {
  recordFilters?: ChartRecordFilter[];
  recordFilterGroups?: ChartRecordFilterGroup[];
};

export type UniversalChartFilter =
  FormatRecordSerializedRelationProperties<ChartFilter>;
