import { getFieldUniversalIdentifier } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

type BuildNameFlatFieldMetadataForCustomObjectArgs = {
  flatObjectMetadata: Pick<
    UniversalFlatObjectMetadata,
    'universalIdentifier' | 'applicationUniversalIdentifier'
  >;
};

export const buildNameFlatFieldMetadataForCustomObject = ({
  flatObjectMetadata: {
    applicationUniversalIdentifier,
    universalIdentifier: objectMetadataUniversalIdentifier,
  },
}: BuildNameFlatFieldMetadataForCustomObjectArgs): UniversalFlatFieldMetadata<FieldMetadataType.TEXT> => {
  const now = new Date().toISOString();

  return {
    type: FieldMetadataType.TEXT,
    isLabelSyncedWithName: false,
    isUnique: false,
    universalIdentifier: getFieldUniversalIdentifier({
      applicationUniversalIdentifier,
      objectUniversalIdentifier: objectMetadataUniversalIdentifier,
      name: 'name',
    }),
    name: 'name',
    label: 'Name',
    icon: 'IconAbc',
    description: 'Name',
    isNullable: true,
    isActive: true,
    isSystem: false,
    isSystemSideEffect: false,
    isUIEditable: true,
    defaultValue: null,
    createdAt: now,
    updatedAt: now,
    options: null,
    overrides: null,
    morphId: null,
    applicationUniversalIdentifier,
    objectMetadataUniversalIdentifier,
    relationTargetObjectMetadataUniversalIdentifier: null,
    relationTargetFieldMetadataUniversalIdentifier: null,
    viewFilterUniversalIdentifiers: [],
    viewFieldUniversalIdentifiers: [],
    kanbanAggregateOperationViewUniversalIdentifiers: [],
    calendarViewUniversalIdentifiers: [],
    calendarEndViewUniversalIdentifiers: [],
    mainGroupByFieldMetadataViewUniversalIdentifiers: [],
    fieldPermissionUniversalIdentifiers: [],
    universalSettings: null,
    viewSortUniversalIdentifiers: [],
    searchFieldMetadataUniversalIdentifiers: [],
  };
};
