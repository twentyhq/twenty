import omit from 'lodash.omit';
import { type FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';

export const buildMorphRelationHeadFromTarget = ({
  target,
  targetObject,
  inverse,
}: {
  target: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
  targetObject: Pick<FlatObjectMetadata, 'nameSingular' | 'namePlural'>;
  inverse: Pick<FlatFieldMetadata, 'label' | 'name' | 'icon'> | undefined;
}): FlatFieldMetadata<FieldMetadataType.MORPH_RELATION> => {
  const inverseSettings = {
    targetFieldLabel: inverse?.label,
    targetFieldName: inverse?.name,
    targetFieldIcon: inverse?.icon ?? undefined,
  };

  return {
    ...target,
    universalIdentifier: target.morphId,
    name: getMorphNameFromMorphFieldMetadataName({
      morphRelationFlatFieldMetadata: target,
      nameSingular: targetObject.nameSingular,
      namePlural: targetObject.namePlural,
    }),
    isSystemSideEffect: false,
    settings: {
      ...omit(target.settings, 'joinColumnName'),
      ...inverseSettings,
    },
    universalSettings: {
      ...omit(target.universalSettings, 'joinColumnName'),
      ...inverseSettings,
    },
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    relationTargetFieldMetadataUniversalIdentifier: null,
    relationTargetObjectMetadataUniversalIdentifier: null,
    viewFieldIds: [],
    viewFilterIds: [],
    viewSortIds: [],
    fieldPermissionIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    calendarEndViewIds: [],
    mainGroupByFieldMetadataViewIds: [],
    searchFieldMetadataIds: [],
    viewFieldUniversalIdentifiers: [],
    viewFilterUniversalIdentifiers: [],
    viewSortUniversalIdentifiers: [],
    fieldPermissionUniversalIdentifiers: [],
    kanbanAggregateOperationViewUniversalIdentifiers: [],
    calendarViewUniversalIdentifiers: [],
    calendarEndViewUniversalIdentifiers: [],
    mainGroupByFieldMetadataViewUniversalIdentifiers: [],
    searchFieldMetadataUniversalIdentifiers: [],
  };
};
