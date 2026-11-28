import { isDefined } from 'twenty-shared/utils';

import {
  EventMetadataException,
  EventMetadataExceptionCode,
} from 'src/engine/metadata-modules/event-metadata/event-metadata.exception';
import { type FlatEventMetadata } from 'src/engine/metadata-modules/flat-event-metadata/types/flat-event-metadata.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntitiesByApplicationId } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entities-by-application-id.util';

export const findApplicationFlatEventMetadataOrThrow = ({
  flatEventMetadataMaps,
  applicationId,
  name,
  universalIdentifier,
}: {
  flatEventMetadataMaps: FlatEntityMaps<FlatEventMetadata>;
  applicationId: string;
  name?: string;
  universalIdentifier?: string;
}): FlatEventMetadata => {
  if (isDefined(name) === isDefined(universalIdentifier)) {
    throw new EventMetadataException(
      'Pass either the event name or its universal identifier',
      EventMetadataExceptionCode.INVALID_EVENT_TARGET,
    );
  }

  // Only the caller's own events, so an app cannot emit another app's event
  const flatEventMetadata = findFlatEntitiesByApplicationId({
    flatEntityMaps: flatEventMetadataMaps,
    applicationId,
  }).find((applicationFlatEventMetadata) =>
    isDefined(name)
      ? applicationFlatEventMetadata.name === name
      : applicationFlatEventMetadata.universalIdentifier ===
        universalIdentifier,
  );

  if (!isDefined(flatEventMetadata)) {
    throw new EventMetadataException(
      `Event "${name ?? universalIdentifier}" is not declared by this application`,
      EventMetadataExceptionCode.EVENT_METADATA_NOT_FOUND,
    );
  }

  return flatEventMetadata;
};
