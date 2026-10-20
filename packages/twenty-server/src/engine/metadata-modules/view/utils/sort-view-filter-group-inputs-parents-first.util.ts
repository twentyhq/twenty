import { isDefined } from 'twenty-shared/utils';

import { type UpsertViewWidgetViewFilterGroupInput } from 'src/engine/metadata-modules/view/dtos/inputs/upsert-view-widget-view-filter-group.input';

export const sortViewFilterGroupInputsParentsFirst = (
  inputFilterGroups: UpsertViewWidgetViewFilterGroupInput[],
): UpsertViewWidgetViewFilterGroupInput[] => {
  const inputFilterGroupById = new Map(
    inputFilterGroups
      .filter((inputGroup) => isDefined(inputGroup.id))
      .map((inputGroup) => [inputGroup.id, inputGroup]),
  );

  const sortedInputFilterGroups: UpsertViewWidgetViewFilterGroupInput[] = [];
  const visitedInputFilterGroups =
    new Set<UpsertViewWidgetViewFilterGroupInput>();

  const visit = (inputGroup: UpsertViewWidgetViewFilterGroupInput) => {
    if (visitedInputFilterGroups.has(inputGroup)) {
      return;
    }

    visitedInputFilterGroups.add(inputGroup);

    const parentInputGroup = isDefined(inputGroup.parentViewFilterGroupId)
      ? inputFilterGroupById.get(inputGroup.parentViewFilterGroupId)
      : undefined;

    if (isDefined(parentInputGroup)) {
      visit(parentInputGroup);
    }

    sortedInputFilterGroups.push(inputGroup);
  };

  inputFilterGroups.forEach(visit);

  return sortedInputFilterGroups;
};
