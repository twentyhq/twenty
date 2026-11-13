import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export const isOneToManyRelationUniversalFlatFieldMetadata = ({
  type,
  universalSettings,
}: Pick<UniversalFlatFieldMetadata, 'type' | 'universalSettings'>): boolean =>
  type === FieldMetadataType.RELATION &&
  isDefined(universalSettings) &&
  'relationType' in universalSettings &&
  universalSettings.relationType === RelationType.ONE_TO_MANY;
