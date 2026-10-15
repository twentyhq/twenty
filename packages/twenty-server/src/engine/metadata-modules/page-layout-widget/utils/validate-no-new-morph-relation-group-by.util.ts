import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';

const getGroupByFieldMetadataIds = (
  configuration: AllPageLayoutWidgetConfiguration | null | undefined,
): string[] => {
  switch (configuration?.configurationType) {
    case WidgetConfigurationType.BAR_CHART:
    case WidgetConfigurationType.LINE_CHART:
      return [
        configuration.primaryAxisGroupByFieldMetadataId,
        configuration.secondaryAxisGroupByFieldMetadataId,
      ].filter(isDefined);
    case WidgetConfigurationType.PIE_CHART:
      return [configuration.groupByFieldMetadataId].filter(isDefined);
    default:
      return [];
  }
};

export const validateNoNewMorphRelationGroupByOrThrow = ({
  configuration,
  existingConfiguration,
  flatFieldMetadataMaps,
}: {
  configuration: AllPageLayoutWidgetConfiguration | null | undefined;
  existingConfiguration: AllPageLayoutWidgetConfiguration | null | undefined;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): void => {
  const existingGroupByFieldMetadataIds = new Set(
    getGroupByFieldMetadataIds(existingConfiguration),
  );

  for (const fieldMetadataId of getGroupByFieldMetadataIds(configuration)) {
    if (existingGroupByFieldMetadataIds.has(fieldMetadataId)) {
      continue;
    }

    const field = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (isDefined(field) && field.type === FieldMetadataType.MORPH_RELATION) {
      throw new PageLayoutWidgetException(
        `Charts cannot be grouped by the morph relation field "${field.name}".`,
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        {
          userFriendlyMessage: msg`Charts cannot be grouped by a field that relates to several objects.`,
        },
      );
    }
  }
};
