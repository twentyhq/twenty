import { type I18n } from '@lingui/core';
import { type APP_LOCALES } from 'twenty-shared/translations';
import {
  interpolateCommandMenuItemTemplate,
  isDefined,
} from 'twenty-shared/utils';

import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { buildNavigationInterpolationContext } from 'src/engine/metadata-modules/command-menu-item/utils/build-navigation-interpolation-context.util';
import { isObjectMetadataCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/utils/is-object-metadata-command-menu-item-payload.util';
import { FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type EnrichCommandMenuItemEventArgs = {
  record: FlatCommandMenuItem;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  locale: keyof typeof APP_LOCALES | undefined;
  i18nInstance: I18n;
};

export const enrichCommandMenuItemEventWithResolvedNavigation = ({
  record,
  flatObjectMetadataMaps,
  locale,
  i18nInstance,
}: EnrichCommandMenuItemEventArgs): FlatCommandMenuItem => {
  if (record.engineComponentKey !== EngineComponentKey.NAVIGATION) {
    return record;
  }

  const payload = record.payload;

  if (!isObjectMetadataCommandMenuItemPayload(payload)) {
    return record;
  }

  const objectMetadataItemId = payload.objectMetadataItemId;

  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: objectMetadataItemId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(flatObjectMetadata)) {
    return record;
  }

  const context = buildNavigationInterpolationContext({
    objectMetadata: flatObjectMetadata,
    locale,
    i18nInstance,
  });

  const enriched = { ...record };

  for (const field of ['label', 'shortLabel', 'icon'] as const) {
    const rawValue = record[field];

    const resolvedValue = interpolateCommandMenuItemTemplate({
      label: rawValue,
      context,
    });

    if (isDefined(resolvedValue)) {
      enriched[field] = resolvedValue;
    }
  }

  return enriched;
};
