import { type ViewFilterOperand } from '../ViewFilterOperand';
import { type PageLayoutFilterType } from './PageLayoutFilterType';

export type PageLayoutFilterCondition = {
  operand: ViewFilterOperand;
  value: string;
};

export type PageLayoutFilterValue = {
  conditions: PageLayoutFilterCondition[];
};

export type PageLayoutFilter = {
  id: string;
  label: string;
  type: PageLayoutFilterType;
  position: number;
  defaultValue: PageLayoutFilterValue | null;
};
