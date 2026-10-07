import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
  type DashboardFilterValue,
  FieldMetadataType,
} from '@/types';
import { ViewFilterOperand } from '@/types/ViewFilterOperand';
import { isRecordFilterValueValid } from '@/utils/filter/isRecordFilterValueValid';
import { type RecordFilter } from '@/utils/filter/turnRecordFilterGroupIntoGqlOperationFilter';
import { getFilterTypeFromFieldType } from '@/utils/filter/utils/getFilterTypeFromFieldType';
import { arrayOfUuidOrVariableSchema } from '@/utils/filter/utils/validation-schemas/arrayOfUuidsOrVariablesSchema';
import { jsonRelationFilterValueSchema } from '@/utils/filter/utils/validation-schemas/jsonRelationFilterValueSchema';
import { isDefined } from '@/utils/validation/isDefined';

type BuildRecordFiltersFromDashboardFiltersArgs = {
  slots: DashboardFilterSlot[];
  values: Record<string, DashboardFilterValue | undefined>;
  bindings: Record<string, DashboardFilterBinding | null> | undefined;
  fieldMetadataItems: { id: string; type: FieldMetadataType }[];
  currentWorkspaceMemberId?: string | null;
};

export const getDashboardFilterRecordFilterId = (slotId: string) =>
  `dashboard-filter-${slotId}`;

// A chart on the slot's target object binds its own id: the relation value (record ids, "Me") becomes a UUID filter.
const buildUuidRecordIds = ({
  value,
  currentWorkspaceMemberId,
}: {
  value: string;
  currentWorkspaceMemberId: string | null | undefined;
}): string[] => {
  const { isCurrentWorkspaceMemberSelected, selectedRecordIds } =
    jsonRelationFilterValueSchema
      .catch({
        isCurrentWorkspaceMemberSelected: false,
        isCurrentRecordSelected: false,
        selectedRecordIds: arrayOfUuidOrVariableSchema.parse(value),
      })
      .parse(value);

  return [
    ...selectedRecordIds,
    ...(isCurrentWorkspaceMemberSelected === true &&
    isDefined(currentWorkspaceMemberId)
      ? [currentWorkspaceMemberId]
      : []),
  ];
};

// Filters stay ungrouped so computeRecordGqlOperationFilter ANDs them at the root with the widget's own filters.
export const buildRecordFiltersFromDashboardFilters = ({
  slots,
  values,
  bindings,
  fieldMetadataItems,
  currentWorkspaceMemberId,
}: BuildRecordFiltersFromDashboardFiltersArgs): RecordFilter[] => {
  if (!isDefined(bindings)) {
    return [];
  }

  const fieldMetadataItemById = new Map(
    fieldMetadataItems.map((fieldMetadataItem) => [
      fieldMetadataItem.id,
      fieldMetadataItem,
    ]),
  );

  return slots.flatMap((slot) => {
    const value = values[slot.id];
    const binding = bindings[slot.id];

    if (!isDefined(value) || !isDefined(binding)) {
      return [];
    }

    // Valueless operands (IS_TODAY, IS_EMPTY, ...) are legitimately empty-valued.
    if (!isRecordFilterValueValid(value)) {
      return [];
    }

    const boundFieldMetadataItem = fieldMetadataItemById.get(
      binding.fieldMetadataId,
    );

    if (!isDefined(boundFieldMetadataItem)) {
      return [];
    }

    const recordFilterBase = {
      id: getDashboardFilterRecordFilterId(slot.id),
      fieldMetadataId: binding.fieldMetadataId,
      subFieldName: binding.subFieldName,
      relationTargetFieldMetadataId:
        binding.relationTargetFieldMetadataId ?? null,
    };

    if (
      slot.filterType === 'RELATION' &&
      boundFieldMetadataItem.type === FieldMetadataType.UUID
    ) {
      // An id is never empty, so emptiness operands cannot mean anything on the target object itself.
      if (
        value.operand === ViewFilterOperand.IS_EMPTY ||
        value.operand === ViewFilterOperand.IS_NOT_EMPTY
      ) {
        return [];
      }

      const recordIds = buildUuidRecordIds({
        value: value.value,
        currentWorkspaceMemberId,
      });

      if (recordIds.length === 0) {
        return [];
      }

      return [
        {
          ...recordFilterBase,
          type: 'UUID',
          operand: value.operand,
          value: JSON.stringify(recordIds),
        },
      ];
    }

    return [
      {
        ...recordFilterBase,
        type: getFilterTypeFromFieldType(boundFieldMetadataItem.type),
        operand: value.operand,
        value: value.value,
      },
    ];
  });
};
