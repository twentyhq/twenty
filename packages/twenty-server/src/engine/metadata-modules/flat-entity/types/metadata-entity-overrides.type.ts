import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';

export type MetadataEntityOverrides<T extends AllMetadataName> =
  MetadataEntity<T> extends { overrides: infer TOverrides }
    ? NonNullable<TOverrides>
    : never;
