import { type FilterableAndTSVectorFieldType } from '../FilterableFieldType';
import { type SerializedRelation } from '../SerializedRelation';
import { type ViewFilterOperand } from '../ViewFilterOperand';

// A slot carries no field reference: each chart widget binds it to one of its own fields.
export type DashboardFilterSlot = {
  id: string;
  label: string;
  filterType: FilterableAndTSVectorFieldType;
  defaultOperand?: ViewFilterOperand | null;
  defaultValue?: string | null;
  isRequired?: boolean;
};

export type DashboardFilterBinding = {
  fieldMetadataId: SerializedRelation;
  subFieldName?: string | null;
  relationTargetFieldMetadataId?: SerializedRelation | null;
};

export type DashboardFilterValue = {
  operand: ViewFilterOperand;
  value: string;
};
