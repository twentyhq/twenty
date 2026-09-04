import { type AllMetadataName } from 'twenty-shared/metadata';

import { keepExistingIdentifiersByNaturalKey } from 'src/engine/metadata-modules/flat-entity/utils/keep-existing-identifiers-by-natural-key.util';
import { keepWorkspaceOwnedProperties } from 'src/engine/metadata-modules/flat-entity/utils/keep-workspace-owned-properties.util';

type FlatEntityMapsByUniversalIdentifier = {
  byUniversalIdentifier: Partial<
    Record<string, { universalIdentifier: string } & Record<string, unknown>>
  >;
};

export const reconcileToFlatEntityMaps = <
  TFlatEntityMaps extends FlatEntityMapsByUniversalIdentifier,
>({
  metadataName,
  fromFlatEntityMaps,
  toFlatEntityMaps,
}: {
  metadataName: AllMetadataName;
  fromFlatEntityMaps: TFlatEntityMaps;
  toFlatEntityMaps: TFlatEntityMaps;
}): TFlatEntityMaps =>
  keepWorkspaceOwnedProperties({
    metadataName,
    fromFlatEntityMaps,
    toFlatEntityMaps: keepExistingIdentifiersByNaturalKey({
      metadataName,
      fromFlatEntityMaps,
      toFlatEntityMaps,
    }),
  });
