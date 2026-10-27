import { type FlatEventMetadata } from 'src/engine/metadata-modules/flat-event-metadata/types/flat-event-metadata.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const findRecordScopeFlatObjectMetadata = ({
  flatEventMetadata,
  scopeProperty,
  flatObjectMetadataMaps,
}: {
  flatEventMetadata: Pick<FlatEventMetadata, 'properties'>;
  scopeProperty: string;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): FlatObjectMetadata | undefined => {
  const property = flatEventMetadata.properties.find(
    (eventProperty) => eventProperty.name === scopeProperty,
  );

  return property?.type === 'RECORD_REFERENCE'
    ? findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: property.objectUniversalIdentifier,
      })
    : undefined;
};
