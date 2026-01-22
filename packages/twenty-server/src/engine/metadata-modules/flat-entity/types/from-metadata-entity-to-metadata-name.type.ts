import { type AllMetadataName } from 'twenty-shared/metadata';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { type SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { Expect } from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

export type FromMetadataEntityToMetadataName<T extends SyncableEntity> = {
  [P in AllMetadataName]: AllFlatEntityTypesByMetadataName[P] extends {
    entity: T;
  }
    ? P
    : never;
}[AllMetadataName];

// metadata name lookups works with the base entity type, not with narrowed variants.
// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<
    [never] extends [
      FromMetadataEntityToMetadataName<
        FieldMetadataEntity<FieldMetadataType.RELATION>
      >,
    ]
      ? true
      : false
  >,
];
