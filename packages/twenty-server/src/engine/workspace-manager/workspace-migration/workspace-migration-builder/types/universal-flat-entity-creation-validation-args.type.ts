import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

export type FlatEntityCreationValidationArgs<
  TMetadataName extends AllMetadataName,
> = UniversalFlatEntityValidationArgs<TMetadataName> & {
  finalFlatEntityMaps: MetadataUniversalFlatEntityMaps<TMetadataName>;
};
