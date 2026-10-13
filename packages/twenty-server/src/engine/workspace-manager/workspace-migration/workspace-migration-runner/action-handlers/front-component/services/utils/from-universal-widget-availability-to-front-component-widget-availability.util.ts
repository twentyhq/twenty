import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { type UniversalFrontComponentWidgetAvailability } from 'src/engine/metadata-modules/flat-front-component/types/universal-front-component-widget-availability.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FrontComponentWidgetAvailability } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';

export const fromUniversalWidgetAvailabilityToFrontComponentWidgetAvailability =
  ({
    universalWidgetAvailability,
    flatObjectMetadataMaps,
  }: {
    universalWidgetAvailability: UniversalFrontComponentWidgetAvailability[];
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  }): FrontComponentWidgetAvailability[] =>
    universalWidgetAvailability.flatMap(
      ({ objectMetadataUniversalIdentifier, ...entry }) => {
        if (objectMetadataUniversalIdentifier === undefined) {
          return [entry];
        }

        if (objectMetadataUniversalIdentifier === null) {
          return [];
        }

        const flatObjectMetadata =
          findFlatEntityByUniversalIdentifierOrThrow<FlatObjectMetadata>({
            flatEntityMaps: flatObjectMetadataMaps,
            universalIdentifier: objectMetadataUniversalIdentifier,
          });

        return [{ ...entry, objectMetadataId: flatObjectMetadata.id }];
      },
    );
