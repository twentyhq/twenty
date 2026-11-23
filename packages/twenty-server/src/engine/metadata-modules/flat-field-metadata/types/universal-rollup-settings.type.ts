import { type FieldMetadataType } from 'twenty-shared/types';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export type UniversalRollupSettings =
  UniversalFlatFieldMetadata<FieldMetadataType.ROLLUP>['universalSettings'];
