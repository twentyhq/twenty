import { faker } from '@faker-js/faker';
import {
  type FieldMetadataType,
  type NonNullableRequired,
} from 'twenty-shared/types';

import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

type GetMorphOrRelationFlatFieldMetadataMockArgs = NonNullableRequired<
  Pick<
    FlatFieldMetadata<FieldMetadataType.RELATION>,
    | 'universalIdentifier'
    | 'objectMetadataId'
    | 'type'
    | 'settings'
    | 'relationTargetFieldMetadataId'
    | 'relationTargetObjectMetadataId'
  >
> &
  Partial<FlatFieldMetadata>;

export const getRelationTargetFlatFieldMetadataMock = ({
  objectMetadataId,
  settings,
  type,
  universalIdentifier,
  relationTargetFieldMetadataId,
  relationTargetObjectMetadataId,
  ...overrides
}: GetMorphOrRelationFlatFieldMetadataMockArgs): FlatFieldMetadata<MorphOrRelationFieldMetadataType> => {
  const createdAt = '2024-01-01T00:00:00.000Z';

  return {
    calendarViewIds: [],
    mainGroupByFieldMetadataViewIds: [],
    viewFilterIds: [],
    viewFieldIds: [],
    kanbanAggregateOperationViewIds: [],
    createdAt,
    updatedAt: createdAt,
    description: 'default flat field metadata description',
    icon: 'icon',
    id: faker.string.uuid(),
    isActive: true,
    isCustom: true,
    name: 'flatFieldMetadataName',
    label: 'flat field metadata label',
    isNullable: true,
    isUnique: false,
    isUIReadOnly: false,
    isLabelSyncedWithName: false,
    isSystem: false,
    standardId: null,
    standardOverrides: null,
    workspaceId: faker.string.uuid(),
    objectMetadataId,
    type,
    universalIdentifier,
    settings,
    relationTargetFieldMetadataId,
    relationTargetObjectMetadataId,
    morphId: null,
    ...overrides,
    defaultValue: null,
    options: null,
    applicationId: faker.string.uuid(),
  };
};
