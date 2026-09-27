import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataValidationRelatedUniversalFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-types.type';
import { type StandardObjectMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-object-metadata-related-entity-ids.util';
import { type ComputeTwentyStandardApplicationAllFlatEntityMapsArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-current-twenty-standard-application-all-flat-entity-maps.util';

export type StandardBuilderArgs<T extends AllMetadataName> = {
  standardObjectMetadataRelatedEntityIds: StandardObjectMetadataRelatedEntityIds;
  dependencyFlatEntityMaps: MetadataValidationRelatedUniversalFlatEntityMaps<T>;
} & ComputeTwentyStandardApplicationAllFlatEntityMapsArgs;
