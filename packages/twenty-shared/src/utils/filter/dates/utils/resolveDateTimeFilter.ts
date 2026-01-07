import { ViewFilterOperand } from '@/types';
import { resolveRelativeDateTimeFilterStringified } from '@/utils/filter/dates/utils/resolveRelativeDateTimeFilterStringified';

export type ResolvedDateTimeFilterValue<O extends ViewFilterOperand> =
  O extends ViewFilterOperand.IS_RELATIVE
    ? ReturnType<typeof resolveRelativeDateTimeFilterStringified>
    : string | null;

type PartialViewFilter<O extends ViewFilterOperand> = {
  value: string;
  operand: O;
}; // TODO, was done to avoid ViewFilter export

export const resolveDateTimeFilter = <O extends ViewFilterOperand>(
  viewFilter: PartialViewFilter<O>,
): ResolvedDateTimeFilterValue<O> => {
  if (!viewFilter.value) return null;

  if (viewFilter.operand === ViewFilterOperand.IS_RELATIVE) {
    return resolveRelativeDateTimeFilterStringified(
      viewFilter.value,
    ) as ResolvedDateTimeFilterValue<O>;
  }
  return viewFilter.value as ResolvedDateTimeFilterValue<O>;
};
