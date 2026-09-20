import { Logger } from '@nestjs/common';

import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntitiesByApplicationId } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entities-by-application-id.util';
import { getSubFlatEntityByIdsMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-flat-entity-by-ids-maps-or-throw.util';

const diagLogger = new Logger('DIAG-06');

export const getSubFlatEntityMapsByApplicationIdsOrThrow = <
  T extends SyncableFlatEntity,
>({
  applicationIds,
  flatEntityMaps,
}: {
  applicationIds: string[];
  flatEntityMaps: FlatEntityMaps<T>;
}) => {
  const allFlatEntityIds = applicationIds.flatMap((applicationId) => {
    const entities = findFlatEntitiesByApplicationId({
      applicationId,
      flatEntityMaps,
    });

    return entities.map((entity) => entity.id);
  });

  const uniqueFlatEntityIds = [...new Set(allFlatEntityIds)];

  diagLogger.debug(
    `[DIAG-06] applicationIds=${JSON.stringify(applicationIds)} beforeKeys=${JSON.stringify(Object.keys(flatEntityMaps.byUniversalIdentifier))} uniqueFlatEntityIds=${JSON.stringify(uniqueFlatEntityIds)}`,
  );

  return getSubFlatEntityByIdsMapsOrThrow({
    flatEntityIds: uniqueFlatEntityIds,
    flatEntityMaps,
  });
};
