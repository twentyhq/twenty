import { faker } from '@faker-js/faker';
import { type NonNullableRequired } from 'twenty-shared/types';

import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatRelationTargetFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-relation-target-field-metadata.type';

type GetMorphOrRelationFlatFieldMetadataMockArgs = NonNullableRequired<
  Pick<
    FlatFieldMetadata<MorphOrRelationFieldMetadataType>,
    | 'universalIdentifier'
    | 'objectMetadataId'
    | 'type'
    | 'settings'
    | 'relationTargetFieldMetadataId'
    | 'relationTargetObjectMetadataId'
  >
> &
  Partial<FlatFieldMetadata>;

export const getMorphOrRelationTargetFlatFieldMetadataMock = ({
  objectMetadataId,
  settings,
  type,
  universalIdentifier,
  relationTargetFieldMetadataId,
  relationTargetObjectMetadataId,
  ...overrides
}: GetMorphOrRelationFlatFieldMetadataMockArgs): FlatRelationTargetFieldMetadata => {
  const createdAt = '2024-01-01T00:00:00.000Z' as unknown as Date;

  return {
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
    ...overrides,
    defaultValue: null,
    options: null,
  };
};
