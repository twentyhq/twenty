import { isNull } from '@sniptt/guards';

import {
  type DashboardFilterBinding,
  type DashboardFilterFieldResolution,
  type PageLayoutFilterType,
  type PartialFieldMetadataItem,
} from '@/types';
import { isFieldBindableToDashboardFilter } from '@/utils/pageLayout/isFieldBindableToDashboardFilter';
import { isDefined } from '@/utils/validation/isDefined';

export const resolveDashboardFilterFieldForWidget = ({
  pageLayoutFilterId,
  filterType,
  bindings,
  groupByFieldMetadataIds,
  widgetFilterFieldMetadataIds,
  fields,
}: {
  pageLayoutFilterId: string;
  filterType: PageLayoutFilterType;
  bindings: DashboardFilterBinding[] | null | undefined;
  groupByFieldMetadataIds: string[];
  widgetFilterFieldMetadataIds: string[];
  fields: Pick<PartialFieldMetadataItem, 'id' | 'name' | 'type'>[];
}): DashboardFilterFieldResolution => {
  // Deactivated fields stay candidates: chart queries keep using them (#28082)
  const bindableFields = fields.filter((field) =>
    isFieldBindableToDashboardFilter({ field, filterType }),
  );
  const bindableFieldIds = new Set(bindableFields.map(({ id }) => id));

  const binding = bindings?.find(
    (dashboardFilterBinding) =>
      dashboardFilterBinding.pageLayoutFilterId === pageLayoutFilterId,
  );

  if (isDefined(binding)) {
    if (isNull(binding.fieldMetadataId)) {
      return { fieldMetadataId: null, source: 'NOT_APPLIED' };
    }

    return bindableFieldIds.has(binding.fieldMetadataId)
      ? { fieldMetadataId: binding.fieldMetadataId, source: 'OVERRIDE' }
      : { fieldMetadataId: null, source: 'UNRESOLVED' };
  }

  const groupByFieldMetadataId = groupByFieldMetadataIds.find(
    (fieldMetadataId) => bindableFieldIds.has(fieldMetadataId),
  );

  if (isDefined(groupByFieldMetadataId)) {
    return { fieldMetadataId: groupByFieldMetadataId, source: 'GROUP_BY' };
  }

  const widgetFilterFieldMetadataId = widgetFilterFieldMetadataIds.find(
    (fieldMetadataId) => bindableFieldIds.has(fieldMetadataId),
  );

  if (isDefined(widgetFilterFieldMetadataId)) {
    return {
      fieldMetadataId: widgetFilterFieldMetadataId,
      source: 'WIDGET_FILTER',
    };
  }

  const createdAtField = bindableFields.find(
    ({ name }) => name === 'createdAt',
  );

  if (isDefined(createdAtField)) {
    return { fieldMetadataId: createdAtField.id, source: 'CREATED_AT' };
  }

  return { fieldMetadataId: null, source: 'UNRESOLVED' };
};
