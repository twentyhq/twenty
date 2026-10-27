import { isDefined } from 'twenty-shared/utils';

import { type FlatEventMetadata } from 'src/engine/metadata-modules/flat-event-metadata/types/flat-event-metadata.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';

export const findApplicationFlatEventMetadataByName = ({
  flatEventMetadataMaps,
  applicationId,
  name,
}: {
  flatEventMetadataMaps: FlatEntityMaps<FlatEventMetadata>;
  applicationId: string;
  name: string;
}): FlatEventMetadata | undefined =>
  Object.values(flatEventMetadataMaps.byUniversalIdentifier).find(
    (flatEventMetadata): flatEventMetadata is FlatEventMetadata =>
      isDefined(flatEventMetadata) &&
      flatEventMetadata.applicationId === applicationId &&
      flatEventMetadata.name === name,
  );
