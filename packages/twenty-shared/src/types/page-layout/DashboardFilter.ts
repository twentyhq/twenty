import { type CompositeFieldSubFieldName } from '../CompositeFieldSubFieldNameType';
import { type FilterableFieldType } from '../FilterableFieldType';
import { type FormatRecordSerializedRelationProperties } from '../FormatRecordSerializedRelationProperties';
import { type SerializedRelation } from '../SerializedRelation';
import { type ViewFilterOperand } from '../ViewFilterOperand';

// A slot carries no field reference: each chart widget binds it to one of its own fields.
export type DashboardFilterSlot = {
  id: string;
  label: string;
  filterType: FilterableFieldType;
  defaultOperand?: ViewFilterOperand | null;
  defaultValue?: string | null;
  isRequired?: boolean;
};

export type DashboardFilterBinding = {
  fieldMetadataId: SerializedRelation;
  subFieldName?: CompositeFieldSubFieldName | null;
  relationTargetFieldMetadataId?: SerializedRelation | null;
};

export type UniversalDashboardFilterBinding =
  FormatRecordSerializedRelationProperties<DashboardFilterBinding>;

export type DashboardFilterValue = {
  operand: ViewFilterOperand;
  value: string;
};
