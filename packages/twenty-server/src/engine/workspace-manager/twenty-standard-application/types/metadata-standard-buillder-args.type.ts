import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataValidationRelatedFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-types.type';
import { type StandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-field-metadata-id-by-object-and-field-name.util';
import { type ComputeTwentyStandardApplicationAllFlatEntityMapsArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

export type StandardBuilderArgs<T extends AllMetadataName> = {
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
  dependencyFlatEntityMaps: MetadataValidationRelatedFlatEntityMaps<T>;
} & ComputeTwentyStandardApplicationAllFlatEntityMapsArgs;
