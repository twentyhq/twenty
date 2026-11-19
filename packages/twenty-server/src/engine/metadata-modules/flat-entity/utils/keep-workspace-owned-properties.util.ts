import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { WORKSPACE_OWNED_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/workspace-owned-properties-by-metadata-name.constant';
import { pickWorkspaceOwnedProperties } from 'src/engine/metadata-modules/flat-entity/utils/pick-workspace-owned-properties.util';

type FlatEntityMapsByUniversalIdentifier = {
  byUniversalIdentifier: Partial<Record<string, Record<string, unknown>>>;
};

// An application ships a default for workspace-owned properties, so a
// synchronization would otherwise reset the choices a workspace made since.
export const keepWorkspaceOwnedProperties = <
  TFlatEntityMaps extends FlatEntityMapsByUniversalIdentifier,
>({
  metadataName,
  fromFlatEntityMaps,
  toFlatEntityMaps,
}: {
  metadataName: AllMetadataName;
  fromFlatEntityMaps: TFlatEntityMaps;
  toFlatEntityMaps: TFlatEntityMaps;
}): TFlatEntityMaps => {
  if (!isDefined(WORKSPACE_OWNED_PROPERTIES_BY_METADATA_NAME[metadataName])) {
    return toFlatEntityMaps;
  }

  const byUniversalIdentifier = { ...toFlatEntityMaps.byUniversalIdentifier };

  for (const [universalIdentifier, toFlatEntity] of Object.entries(
    byUniversalIdentifier,
  )) {
    const fromFlatEntity =
      fromFlatEntityMaps.byUniversalIdentifier[universalIdentifier];

    if (!isDefined(fromFlatEntity) || !isDefined(toFlatEntity)) {
      continue;
    }

    // A property missing from the workspace entity means its cache predates the
    // property, and the application default is the only value to go on.
    byUniversalIdentifier[universalIdentifier] = {
      ...toFlatEntity,
      ...pickWorkspaceOwnedProperties({
        metadataName,
        flatEntity: fromFlatEntity,
      }),
    };
  }

  return { ...toFlatEntityMaps, byUniversalIdentifier };
};
