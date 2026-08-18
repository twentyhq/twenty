import { isNonEmptyString } from '@sniptt/guards';
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
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/utils/effective-entity-i18n-context.type';
import { type MessageIdTranslator } from 'src/engine/metadata-modules/utils/message-id-translator.type';
import { resolveEffectiveEntityProperty } from 'src/engine/metadata-modules/utils/resolve-effective-entity-property.util';

type EnrichCommandMenuItemEventArgs = {
  record: FlatCommandMenuItem;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  locale: keyof typeof APP_LOCALES | undefined;
  i18nInstance: MessageIdTranslator;
};

const TRANSLATED_FIELDS = ['label', 'shortLabel', 'icon'] as const;

export const enrichCommandMenuItemEventWithResolvedNavigation = ({
  record,
  flatObjectMetadataMaps,
  locale,
  i18nInstance,
}: EnrichCommandMenuItemEventArgs): FlatCommandMenuItem => {
  // Subscription events are built from the flat entity cache, which has no
  // dataloader to batch installed-application catalog lookups, so only the
  // standard catalog is reachable here.
  const buildI18nContext = (
    isStandardApp: boolean,
  ): EffectiveEntityI18nContext => ({
    locale,
    i18nInstance,
    isStandardApp,
    applicationCatalog: undefined,
  });

  const recordI18nContext = buildI18nContext(
    belongsToTwentyStandardApp(record),
  );

  const enriched = { ...record };

  // Resolve before interpolating, and for every item rather than only
  // NAVIGATION ones: an event that carried the source-locale label would
  // replace the locale-resolved item already in the client's metadata store.
  for (const field of TRANSLATED_FIELDS) {
    const rawValue = record[field];

    if (!isNonEmptyString(rawValue)) {
      continue;
    }

    enriched[field] = resolveEffectiveEntityProperty({
      metadataName: 'commandMenuItem',
      baseValue: rawValue,
      overrides: record.overrides,
      property: field,
      i18nContext: recordI18nContext,
    });
  }

  if (record.engineComponentKey !== EngineComponentKey.NAVIGATION) {
    return enriched;
  }

  const payload = record.payload;

  if (!isObjectMetadataCommandMenuItemPayload(payload)) {
    return enriched;
  }

  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: payload.objectMetadataItemId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(flatObjectMetadata)) {
    return enriched;
  }

  const context = buildNavigationInterpolationContext({
    objectMetadata: flatObjectMetadata,
    i18nContext: buildI18nContext(
      belongsToTwentyStandardApp(flatObjectMetadata),
    ),
  });

  for (const field of TRANSLATED_FIELDS) {
    const resolvedValue = interpolateCommandMenuItemTemplate({
      label: enriched[field],
      context,
    });

    if (isDefined(resolvedValue)) {
      enriched[field] = resolvedValue;
    }
  }

  return enriched;
};
