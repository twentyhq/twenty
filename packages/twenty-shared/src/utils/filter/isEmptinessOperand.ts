import { ViewFilterOperand as RecordFilterOperand } from '@/types';

export const isEmptinessOperand = (operand: RecordFilterOperand): boolean => {
  return [RecordFilterOperand.IsEmpty, RecordFilterOperand.IsNotEmpty].includes(
    operand,
  );
};
