import { type FlatEventMetadata } from 'src/engine/metadata-modules/flat-event-metadata/types/flat-event-metadata.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const findRecordScopeFlatObjectMetadata = ({
  flatEventMetadata,
  scopeProperty,
  flatObjectMetadataMaps,
}: {
  flatEventMetadata: Pick<FlatEventMetadata, 'schema'>;
  scopeProperty: string;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): FlatObjectMetadata | undefined => {
  const propertySchema = flatEventMetadata.schema.properties?.[scopeProperty];

  return propertySchema?.type === 'record'
    ? findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: propertySchema.objectUniversalIdentifier ?? '',
      })
    : undefined;
};
