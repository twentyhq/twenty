import { type RecordFilter } from 'twenty-shared/utils';

import { resolveFilterValueAndOperand } from 'src/modules/workflow/workflow-executor/utils/resolve-filter-value-and-operand.util';

export const resolveRecordFilters = ({
  unresolvedRecordFilters,
  context,
}: {
  unresolvedRecordFilters: RecordFilter[] | undefined;
  context: Record<string, unknown>;
}): RecordFilter[] | undefined =>
  unresolvedRecordFilters?.map((recordFilter) => {
    const { value, operand } = resolveFilterValueAndOperand({
      value: recordFilter.value,
      operand: recordFilter.operand,
      context,
    });

    return { ...recordFilter, value: value as string, operand };
  });
