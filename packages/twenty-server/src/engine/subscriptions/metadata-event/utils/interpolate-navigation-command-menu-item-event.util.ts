import { isNonEmptyString } from '@sniptt/guards';
import { interpolateCommandMenuItemPlaceholders } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { buildNavigationPlaceholderValues } from 'src/engine/metadata-modules/command-menu-item/utils/build-navigation-placeholder-values.util';
import { isObjectMetadataCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/utils/is-object-metadata-command-menu-item-payload.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/utils/effective-entity-i18n-context.type';

type InterpolatableCommandMenuItemRecord = Record<string, unknown> & {
  engineComponentKey?: unknown;
  payload?: unknown;
};

const INTERPOLATED_FIELDS = ['label', 'shortLabel', 'icon'] as const;

// NAVIGATION items are the only ones whose placeholders name another entity,
// and the label that fills them is the target object's -- which is locale
// dependent, so this runs at delivery on already-resolved values.
export const interpolateNavigationCommandMenuItemEvent = ({
  record,
  flatObjectMetadataMaps,
  buildI18nContext,
}: {
  record: InterpolatableCommandMenuItemRecord;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  buildI18nContext: (
    applicationId: string | undefined,
  ) => EffectiveEntityI18nContext;
}): InterpolatableCommandMenuItemRecord => {
  if (record.engineComponentKey !== EngineComponentKey.NAVIGATION) {
    return record;
  }

  const payload = record.payload;

  if (!isObjectMetadataCommandMenuItemPayload(payload)) {
    return record;
  }

  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: payload.objectMetadataItemId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(flatObjectMetadata)) {
    return record;
  }

  const placeholderValues = buildNavigationPlaceholderValues({
    objectMetadata: flatObjectMetadata,
    i18nContext: buildI18nContext(
      flatObjectMetadata.applicationId ?? undefined,
    ),
  });

  const interpolated = { ...record };

  for (const field of INTERPOLATED_FIELDS) {
    const value = interpolated[field];

    if (!isNonEmptyString(value)) {
      continue;
    }

    interpolated[field] = interpolateCommandMenuItemPlaceholders(
      value,
      placeholderValues,
    );
  }

  return interpolated;
};
