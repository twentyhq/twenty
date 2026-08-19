import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { computeUniversalFlatViewGroupsForGroupByField } from 'src/engine/metadata-modules/flat-view-group/utils/compute-universal-flat-view-groups-for-group-by-field.util';
import { type UniversalFlatViewGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-group.type';

type ComputeFlatViewGroupsOnViewCreateArgs = {
  flatViewToCreateUniversalIdentifier: string;
  mainGroupByFieldMetadataId: string;
} & Pick<AllFlatEntityMaps, 'flatFieldMetadataMaps'>;

export const computeFlatViewGroupsOnViewCreate = ({
  flatViewToCreateUniversalIdentifier,
  mainGroupByFieldMetadataId,
  flatFieldMetadataMaps,
}: ComputeFlatViewGroupsOnViewCreateArgs): UniversalFlatViewGroup[] => {
  const mainGroupByFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: mainGroupByFieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(mainGroupByFieldMetadata)) {
    throw new FlatEntityMapsException(
      'mainGroupByFieldMetadataId not found',
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return computeUniversalFlatViewGroupsForGroupByField({
    viewUniversalIdentifier: flatViewToCreateUniversalIdentifier,
    mainGroupByFlatFieldMetadata: mainGroupByFieldMetadata,
    applicationUniversalIdentifier:
      mainGroupByFieldMetadata.applicationUniversalIdentifier,
    generateUniversalIdentifier: () => v4(),
    now: new Date().toISOString(),
  });
};
