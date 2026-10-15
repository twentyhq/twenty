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
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';

const GROUP_BY_FIELD_METADATA_ID_KEYS = [
  'primaryAxisGroupByFieldMetadataId',
  'secondaryAxisGroupByFieldMetadataId',
  'groupByFieldMetadataId',
] as const;

const getGroupByFieldMetadataIds = (
  configuration: AllPageLayoutWidgetConfiguration | null | undefined,
): string[] =>
  GROUP_BY_FIELD_METADATA_ID_KEYS.flatMap((key) => {
    const fieldMetadataId = (
      configuration as Partial<Record<string, unknown>> | null | undefined
    )?.[key];

    return typeof fieldMetadataId === 'string' ? [fieldMetadataId] : [];
  });

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
