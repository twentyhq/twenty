import { FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { Equal, Expect } from 'twenty-shared/testing';

// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<
    Equal<
      MetadataUniversalFlatEntityMaps<'fieldMetadata'>['byUniversalIdentifier'][string],
      UniversalFlatFieldMetadata | undefined
    >
  >,
  Expect<
    Equal<
      MetadataUniversalFlatEntityMaps<'viewField'>['byUniversalIdentifier'][string],
      FlatViewField | undefined
    >
  >,
];
