import {
  type DashboardFilterSlot,
  FILTERABLE_FIELD_TYPES,
} from 'twenty-shared/types';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getEffectiveFilterFieldType } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-effective-filter-field-type.util';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { buildChartFieldValidationException } from 'src/engine/metadata-modules/page-layout-widget/utils/build-chart-field-validation-exception.util';
import { findActiveFlatFieldMetadataById } from 'src/engine/metadata-modules/page-layout-widget/utils/find-active-flat-field-metadata-by-id.util';
import { isChartReferencingFieldInConfiguration } from 'src/engine/metadata-modules/page-layout-widget/utils/is-chart-referencing-field-in-configuration.util';

const FILTERABLE_FIELD_TYPE_SET: ReadonlySet<string> = new Set(
  FILTERABLE_FIELD_TYPES,
);

// A RELATION slot filters on record ids, so a chart on the relation target
// object itself binds the slot to its own id field
const isBindingTypeAcceptedForSlot = ({
  effectiveFilterType,
  slotFilterType,
}: {
  effectiveFilterType: DashboardFilterSlot['filterType'];
  slotFilterType: DashboardFilterSlot['filterType'];
}): boolean =>
  effectiveFilterType === slotFilterType ||
  (effectiveFilterType === 'UUID' && slotFilterType === 'RELATION');

// Slots live on the layout and bindings on the widgets, so only the layout
// save has both sides in hand to check that a binding fits its slot
export const validateDashboardFilterBindingsAgainstSlotsOrThrow = ({
  widgetConfiguration,
  widgetTitle,
  dashboardFilters,
  flatFieldMetadataMaps,
}: {
  widgetConfiguration?: AllPageLayoutWidgetConfiguration | null;
  widgetTitle?: string | null;
  dashboardFilters: DashboardFilterSlot[] | null | undefined;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): void => {
  // null slots mean the built-ins apply, and those are not persisted
  if (
    !isDefined(dashboardFilters) ||
    !isDefined(widgetConfiguration) ||
    !isChartReferencingFieldInConfiguration(widgetConfiguration) ||
    !isDefined(widgetConfiguration.dashboardFilterBindings)
  ) {
    return;
  }

  const slotById = new Map(dashboardFilters.map((slot) => [slot.id, slot]));

  for (const [slotId, binding] of Object.entries(
    widgetConfiguration.dashboardFilterBindings,
  )) {
    const slot = slotById.get(slotId);

    if (!isDefined(slot)) {
      throw buildChartFieldValidationException(
        `Dashboard filter "${slotId}" is not defined on this layout.`,
        widgetTitle,
      );
    }

    if (!isDefined(binding)) {
      continue;
    }

    const boundField = findActiveFlatFieldMetadataById(
      binding.fieldMetadataId,
      flatFieldMetadataMaps,
    );

    const relationTargetField = findActiveFlatFieldMetadataById(
      binding.relationTargetFieldMetadataId,
      flatFieldMetadataMaps,
    );

    // Missing fields are reported by the field reference validation
    if (
      !isDefined(boundField) ||
      (isDefined(binding.relationTargetFieldMetadataId) &&
        !isDefined(relationTargetField))
    ) {
      continue;
    }

    const effectiveFieldType = getEffectiveFilterFieldType({
      fieldType: boundField.type,
      relationTargetFieldType: relationTargetField?.type,
    });

    if (!FILTERABLE_FIELD_TYPE_SET.has(effectiveFieldType)) {
      throw buildChartFieldValidationException(
        `Dashboard filter "${slotId}" is bound to a field of type ${effectiveFieldType}, which cannot be filtered.`,
        widgetTitle,
      );
    }

    const effectiveFilterType = getFilterTypeFromFieldType(effectiveFieldType);

    if (
      !isBindingTypeAcceptedForSlot({
        effectiveFilterType,
        slotFilterType: slot.filterType,
      })
    ) {
      throw buildChartFieldValidationException(
        `Dashboard filter "${slotId}" expects a ${slot.filterType} field but is bound to "${boundField.label}" (${effectiveFilterType}).`,
        widgetTitle,
      );
    }
  }
};
