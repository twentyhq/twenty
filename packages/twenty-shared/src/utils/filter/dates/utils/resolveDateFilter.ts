import { ViewFilterOperand } from '@/types';
import { resolveRelativeDateFilterStringified } from '@/utils/filter/dates/utils/resolveRelativeDateFilterStringified';

export type ResolvedDateFilterValue<O extends ViewFilterOperand> =
  O extends ViewFilterOperand.IS_RELATIVE
    ? ReturnType<typeof resolveRelativeDateFilterStringified>
    : string | null;

type PartialViewFilter<O extends ViewFilterOperand> = {
  value: string;
  operand: O;
}; // TODO, was done to avoid ViewFilter export

export const resolveDateFilter = <O extends ViewFilterOperand>(
  viewFilter: PartialViewFilter<O>,
): ResolvedDateFilterValue<O> => {
  if (!viewFilter.value) return null;

  if (viewFilter.operand === ViewFilterOperand.IS_RELATIVE) {
    return resolveRelativeDateFilterStringified(
      viewFilter.value,
    ) as ResolvedDateFilterValue<O>;
  }

  return viewFilter.value as ResolvedDateFilterValue<O>;
};
