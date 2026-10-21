import { type FormatRecordSerializedRelationProperties } from '../FormatRecordSerializedRelationProperties';
import { type SerializedRelation } from '../SerializedRelation';

export type ChartRecordFilter = {
  id?: string;
  fieldMetadataId: SerializedRelation;
  operand: string;
  value?: string | null;
  recordFilterGroupId?: string | null;
  positionInRecordFilterGroup?: number | null;
  subFieldName?: string | null;
  relationTargetFieldMetadataId?: SerializedRelation | null;
};

export type ChartRecordFilterGroup = {
  id: string;
  logicalOperator: string;
  parentRecordFilterGroupId?: string | null;
  positionInRecordFilterGroup?: number | null;
};

export type ChartFilter = {
  recordFilters?: ChartRecordFilter[];
  recordFilterGroups?: ChartRecordFilterGroup[];
};

export type UniversalChartFilter =
  FormatRecordSerializedRelationProperties<ChartFilter>;
