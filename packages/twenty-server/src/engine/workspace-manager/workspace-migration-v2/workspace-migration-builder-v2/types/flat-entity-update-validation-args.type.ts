import {
  MetadataFlatEntity,
  MetadataFlatEntityMaps,
} from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';
import { AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FromTo } from 'twenty-shared/types';

export type FlatEntityUpdateValidationArgs<T extends AllMetadataName> = Omit<
  FlatEntityValidationArgs<T>,
  'flatEntityToValidate' | 'remainingFlatEntityMapsToValidate'
> & {
  flatEntityUpdate: FromTo<MetadataFlatEntity<T>>;
  remainingFlatEntityMapsToValidate: FromTo<MetadataFlatEntityMaps<T>>;
};
