import { type CompositeFieldSubFieldName } from '../CompositeFieldSubFieldNameType';
import { type FormatRecordSerializedRelationProperties } from '../FormatRecordSerializedRelationProperties';
import { type SerializedRelation } from '../SerializedRelation';
import { type ViewFilterOperand } from '../ViewFilterOperand';

export const DASHBOARD_FILTER_SLOT_FILTER_TYPES = [
  'DATE',
  'DATE_TIME',
  'RELATION',
  'SELECT',
  'MULTI_SELECT',
  'TEXT',
  'BOOLEAN',
] as const;

export type DashboardFilterSlotFilterType =
  (typeof DASHBOARD_FILTER_SLOT_FILTER_TYPES)[number];

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
  fieldMetadataId: SerializedRelation;
  subFieldName?: CompositeFieldSubFieldName | null;
  relationTargetFieldMetadataId?: SerializedRelation | null;
};

// null means the slot is explicitly not applied to this chart.
export type DashboardFilterBindingsBySlotId = Record<
  string,
  DashboardFilterBinding | null
>;

export type UniversalDashboardFilterBinding =
  FormatRecordSerializedRelationProperties<DashboardFilterBinding>;

export type UniversalDashboardFilterBindingsBySlotId = Record<
  string,
  UniversalDashboardFilterBinding | null
>;
