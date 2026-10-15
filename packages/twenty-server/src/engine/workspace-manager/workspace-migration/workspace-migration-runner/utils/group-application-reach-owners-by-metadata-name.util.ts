import { isDefined } from 'twenty-shared/utils';

import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type ApplicationReachMetadataName } from 'src/engine/core-modules/authorization/application-reach/types/application-reach-metadata-name.type';
import { isApplicationReachMetadataName } from 'src/engine/core-modules/authorization/application-reach/utils/is-application-reach-metadata-name.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { type WorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration.type';

// The application owning each entity a migration creates, updates or deletes
export const groupApplicationReachOwnersByMetadataName = ({
  actions,
  cachedAllFlatEntityMaps,
  flatApplicationMaps,
}: {
  actions: WorkspaceMigration['actions'];
  cachedAllFlatEntityMaps: Partial<AllFlatEntityMaps>;
  flatApplicationMaps: FlatApplicationCacheMaps;
}): Map<ApplicationReachMetadataName, { applicationId: string }[]> => {
  const ownersByMetadataName = new Map<
    ApplicationReachMetadataName,
    { applicationId: string }[]
  >();

  for (const action of actions) {
    const { metadataName } = action;

    if (!isApplicationReachMetadataName(metadataName)) {
      continue;
    }

    const applicationId =
      action.type === 'create'
        ? flatApplicationMaps.idByUniversalIdentifier[
            (action.flatEntity as { applicationUniversalIdentifier: string })
              .applicationUniversalIdentifier
          ]
        : (
            cachedAllFlatEntityMaps[
              getMetadataFlatEntityMapsKey(metadataName)
            ] as FlatEntityMaps<SyncableFlatEntity> | undefined
          )?.byUniversalIdentifier[action.universalIdentifier]?.applicationId;

    if (!isDefined(applicationId)) {
      continue;
    }

    ownersByMetadataName.set(metadataName, [
      ...(ownersByMetadataName.get(metadataName) ?? []),
      { applicationId },
    ]);
  }

  return ownersByMetadataName;
};
