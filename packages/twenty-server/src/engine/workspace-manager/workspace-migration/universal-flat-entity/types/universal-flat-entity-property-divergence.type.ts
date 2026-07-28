import { type AllMetadataName } from 'twenty-shared/metadata';
import { type FromTo } from 'twenty-shared/types';

import { type MetadataUniversalFlatEntityPropertiesToReportDivergence } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-properties-to-report-divergence.type';

export type UniversalFlatEntityPropertyDivergence<T extends AllMetadataName> = {
  property: MetadataUniversalFlatEntityPropertiesToReportDivergence<T>;
} & FromTo<unknown, 'value'>;
