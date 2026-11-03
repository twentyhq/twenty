import { type ConditionalDisplaySurface } from 'twenty-shared/types';

import { type ConditionalDisplayProperty } from 'src/engine/metadata-modules/flat-conditional-display/types/conditional-display-property.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';

export type ValidateConditionalDisplayContext = {
  property: ConditionalDisplayProperty;
  surface: ConditionalDisplaySurface;
  objectMetadataUniversalIdentifier: string | null;
  invalidDataCode: string;
  flatFieldMetadataMaps: MetadataUniversalFlatEntityMaps<'fieldMetadata'>;
  flatRoleMaps: MetadataUniversalFlatEntityMaps<'role'>;
};
