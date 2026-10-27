import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type EventRealtimeScope } from 'src/engine/metadata-modules/event-metadata/types/event-realtime-scope.type';
import { type FlatEventMetadata } from 'src/engine/metadata-modules/flat-event-metadata/types/flat-event-metadata.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const computeEventOccurrenceRealtimeScopes = ({
  flatEventMetadata,
  flatObjectMetadataMaps,
  properties,
  anonymousId,
}: {
  flatEventMetadata: Pick<FlatEventMetadata, 'properties' | 'capabilities'>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  properties: Record<string, unknown>;
  anonymousId: string | null;
}): EventRealtimeScope[] => {
  const scopes: EventRealtimeScope[] = [];

  for (const scope of flatEventMetadata.capabilities.realtime?.scopes ?? []) {
    if (scope.kind === 'visitor') {
      if (isNonEmptyString(anonymousId)) {
        scopes.push({ kind: 'visitor', anonymousId });
      }
      continue;
    }

    const recordId = properties[scope.property];
    const property = flatEventMetadata.properties.find(
      (eventProperty) => eventProperty.name === scope.property,
    );

    if (!isNonEmptyString(recordId) || property?.type !== 'RECORD_REFERENCE') {
      continue;
    }

    const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatObjectMetadataMaps,
      universalIdentifier: property.objectUniversalIdentifier,
    });

    if (isDefined(flatObjectMetadata)) {
      scopes.push({
        kind: 'record',
        objectMetadataId: flatObjectMetadata.id,
        recordId,
      });
    }
  }

  return scopes;
};
