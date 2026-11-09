import { RecordFilterGroupLogicalOperator, ViewFilterOperand } from '@/types';
import { findRootRecordFilterGroup } from '@/utils/filter/findRootRecordFilterGroup';
import { DASHBOARD_FILTER_PERIOD_OPERANDS } from '@/utils/pageLayout/internal/DashboardFilterPeriodOperands';
import { isDefined } from '@/utils/validation/isDefined';

type WidgetRecordFilter = {
  fieldMetadataId: string;
  operand: string;
  recordFilterGroupId?: string | null;
};

type WidgetRecordFilterGroup = {
  id: string;
  logicalOperator: string;
  parentRecordFilterGroupId?: string | null;
};

// An after + before pair is how the dashboard stores its own custom range
const isPeriodCondition = (
  { operand }: WidgetRecordFilter,
  conditionsOnField: WidgetRecordFilter[],
) =>
  DASHBOARD_FILTER_PERIOD_OPERANDS.some(
    (periodOperand) => periodOperand === operand,
  ) ||
  ((operand === ViewFilterOperand.IS_AFTER ||
    operand === ViewFilterOperand.IS_BEFORE) &&
    conditionsOnField.some(
      (condition) => condition.operand === ViewFilterOperand.IS_AFTER,
    ) &&
    conditionsOnField.some(
      (condition) => condition.operand === ViewFilterOperand.IS_BEFORE,
    ));

// Only conditions ANDed at the root can be replaced: ungrouped ones and those in the root group when it is an AND
export const replaceWidgetFilterPeriodsWithDashboardFilter = <
  TRecordFilter extends WidgetRecordFilter,
  TRecordFilterGroup extends WidgetRecordFilterGroup,
>({
  filter,
  fieldMetadataIds,
}: {
  filter:
    | {
        recordFilters?: TRecordFilter[];
        recordFilterGroups?: TRecordFilterGroup[];
      }
    | null
    | undefined;
  fieldMetadataIds: string[];
}): {
  filter: {
    recordFilters: TRecordFilter[];
    recordFilterGroups: TRecordFilterGroup[];
  };
  replacedRecordFilters: TRecordFilter[];
  stillFilteredFieldMetadataIds: string[];
} => {
  const recordFilters = filter?.recordFilters ?? [];
  const recordFilterGroups = filter?.recordFilterGroups ?? [];

  const rootRecordFilterGroup = findRootRecordFilterGroup(recordFilterGroups);
  const rootAndRecordFilterGroupId =
    rootRecordFilterGroup?.logicalOperator ===
    RecordFilterGroupLogicalOperator.AND
      ? rootRecordFilterGroup.id
      : undefined;

  const replaceableRecordFilters = recordFilters.filter(
    ({ fieldMetadataId, recordFilterGroupId }) =>
      fieldMetadataIds.includes(fieldMetadataId) &&
      (!isDefined(recordFilterGroupId) ||
        recordFilterGroupId === rootAndRecordFilterGroupId),
  );

  const replacedRecordFilters = replaceableRecordFilters.filter(
    (recordFilter) =>
      isPeriodCondition(
        recordFilter,
        replaceableRecordFilters.filter(
          ({ fieldMetadataId }) =>
            fieldMetadataId === recordFilter.fieldMetadataId,
        ),
      ),
  );

  const keptRecordFilters = recordFilters.filter(
    (recordFilter) => !replacedRecordFilters.includes(recordFilter),
  );

  return {
    filter: {
      recordFilters: keptRecordFilters,
      // An emptied group stays, so the compiler keeps the same root; empty, it filters nothing
      recordFilterGroups,
    },
    replacedRecordFilters,
    stillFilteredFieldMetadataIds: fieldMetadataIds.filter((fieldMetadataId) =>
      keptRecordFilters.some(
        (recordFilter) => recordFilter.fieldMetadataId === fieldMetadataId,
      ),
    ),
  };
};
