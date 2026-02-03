import { type AllMetadataName } from 'twenty-shared/metadata';

import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';

export type MetadataFlatEntityMaps<
  T extends AllMetadataName,
  TWithCustomMapsProperties extends boolean = false,
> = TWithCustomMapsProperties extends true
  ? AllFlatEntityTypesByMetadataName[T]['flatEntityMaps']
  : FlatEntityMaps<MetadataFlatEntity<T>>;

export type IsUniversalMigratedMetadata<T extends AllMetadataName> =
  AllFlatEntityTypesByMetadataName[T]['universalMigrated'] extends true
    ? true
    : false;

export type MetadataUniversalFlatEntityMaps<T extends AllMetadataName> =
  FlatEntityMaps<
    IsUniversalMigratedMetadata<T> extends true
      ? AllFlatEntityTypesByMetadataName[T]['universalFlatEntity']
      : AllFlatEntityTypesByMetadataName[T]['flatEntity']
  >;

export type AllUniversalFlatEntityMaps = {
  [P in AllMetadataName as MetadataToFlatEntityMapsKey<P>]: MetadataUniversalFlatEntityMaps<P>;
};

const tmp = {} as AllUniversalFlatEntityMaps;
const toto = tmp.flatFieldMetadataMaps.byUniversalIdentifier['test'];
const titi = tmp.flatViewFieldMaps.byUniversalIdentifier['test'];
