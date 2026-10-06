import { type CompositeFieldSubFieldName } from '../CompositeFieldSubFieldNameType';
import { type ViewFilterOperand } from '../ViewFilterOperand';

export type DashboardFilterSlotFilterType =
  | 'DATE'
  | 'DATE_TIME'
  | 'RELATION'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'TEXT'
  | 'BOOLEAN';

export type DashboardFilterValue = {
  operand: ViewFilterOperand;
  value: string;
};

// A slot is a dashboard-level filter input with no field reference; each chart binds it to one of its own fields.
export type DashboardFilterSlot = {
  id: string;
  label: string;
  filterType: DashboardFilterSlotFilterType;
  defaultValue?: DashboardFilterValue | null;
  isRequired?: boolean;
};

export type DashboardFilterBinding = {
  fieldMetadataId: string;
  subFieldName?: CompositeFieldSubFieldName | null;
  relationTargetFieldMetadataId?: string | null;
};
