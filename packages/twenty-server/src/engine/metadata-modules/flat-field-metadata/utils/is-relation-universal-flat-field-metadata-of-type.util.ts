import { FieldMetadataType, type RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export const isRelationUniversalFlatFieldMetadataOfType = ({
  flatFieldMetadata: { type, universalSettings },
  relationType,
}: {
  flatFieldMetadata: Pick<
    UniversalFlatFieldMetadata,
    'type' | 'universalSettings'
  >;
  relationType: RelationType;
}): boolean =>
  type === FieldMetadataType.RELATION &&
  isDefined(universalSettings) &&
  'relationType' in universalSettings &&
  universalSettings.relationType === relationType;
