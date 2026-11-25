import { isDefined } from 'twenty-shared/utils';

import {
  EventMetadataException,
  EventMetadataExceptionCode,
} from 'src/engine/metadata-modules/event-metadata/event-metadata.exception';
import { type FlatEventMetadata } from 'src/engine/metadata-modules/flat-event-metadata/types/flat-event-metadata.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntitiesByApplicationId } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entities-by-application-id.util';

export const findApplicationFlatEventMetadataByNameOrThrow = ({
  flatEventMetadataMaps,
  applicationId,
  name,
}: {
  flatEventMetadataMaps: FlatEntityMaps<FlatEventMetadata>;
  applicationId: string;
  name: string;
}): FlatEventMetadata => {
  const flatEventMetadata = findFlatEntitiesByApplicationId({
    flatEntityMaps: flatEventMetadataMaps,
    applicationId,
  }).find(
    (applicationFlatEventMetadata) =>
      applicationFlatEventMetadata.name === name,
  );

  if (!isDefined(flatEventMetadata)) {
    throw new EventMetadataException(
      `Event "${name}" is not declared by this application`,
      EventMetadataExceptionCode.EVENT_METADATA_NOT_FOUND,
    );
  }

  return flatEventMetadata;
};
