import omit from 'lodash.omit';
import { type FieldMetadataType } from 'twenty-shared/types';

import { type UniversalMorphRelationHeadFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/universal-morph-relation-head-flat-field-metadata.type';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const buildMorphRelationHeadFromTarget = ({
  target,
  targetObject,
}: {
  target: UniversalFlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
  targetObject: Pick<
    UniversalFlatObjectMetadata,
    'nameSingular' | 'namePlural'
  >;
}): UniversalMorphRelationHeadFlatFieldMetadata => ({
  ...target,
  universalIdentifier: target.morphId,
  name: getMorphNameFromMorphFieldMetadataName({
    morphRelationFlatFieldMetadata: target,
    nameSingular: targetObject.nameSingular,
    namePlural: targetObject.namePlural,
  }),
  isSystemSideEffect: true,
  universalSettings: omit(target.universalSettings, 'joinColumnName'),
  relationTargetFieldMetadataUniversalIdentifier: null,
  relationTargetObjectMetadataUniversalIdentifier: null,
  viewFieldUniversalIdentifiers: [],
  viewFilterUniversalIdentifiers: [],
  viewSortUniversalIdentifiers: [],
  fieldPermissionUniversalIdentifiers: [],
  kanbanAggregateOperationViewUniversalIdentifiers: [],
  calendarViewUniversalIdentifiers: [],
  calendarEndViewUniversalIdentifiers: [],
  mainGroupByFieldMetadataViewUniversalIdentifiers: [],
  searchFieldMetadataUniversalIdentifiers: [],
});
