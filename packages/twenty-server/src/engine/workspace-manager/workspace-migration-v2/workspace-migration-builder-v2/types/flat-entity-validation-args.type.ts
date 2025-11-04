import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataFlatEntityAndRelatedFlatEntityMapsForValidation } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-validation.type';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-builder-options.type';

export type FlatEntityValidationArgs<T extends AllMetadataName> = {
  flatEntityToValidate: MetadataFlatEntity<T>;
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: MetadataFlatEntityAndRelatedFlatEntityMapsForValidation<T>;
  workspaceId: string;
  remainingFlatEntityMapsToValidate: MetadataFlatEntityMaps<T>;
  buildOptions: WorkspaceMigrationBuilderOptions;
};
