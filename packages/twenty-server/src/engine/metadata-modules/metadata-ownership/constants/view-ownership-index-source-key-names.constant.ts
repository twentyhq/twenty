import { type Expect, type Equal } from 'twenty-shared/testing';

import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key.type';
import { type OwnableChildMetadataName } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-child-metadata-name.type';

export const VIEW_OWNERSHIP_INDEX_SOURCE_KEY_NAMES = [
  'flatViewMaps',
  'flatViewFieldMaps',
  'flatViewFilterMaps',
  'flatViewSortMaps',
  'flatViewGroupMaps',
  'flatViewFilterGroupMaps',
  'flatViewFieldGroupMaps',
] as const;

// oxlint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<
    Equal<
      (typeof VIEW_OWNERSHIP_INDEX_SOURCE_KEY_NAMES)[number],
      MetadataToFlatEntityMapsKey<'view' | OwnableChildMetadataName<'view'>>
    >
  >,
];
