import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { createStandardFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-relation-field-flat-metadata.util';
import { type StandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-field-metadata-id-by-object-and-field-name.util';

export const buildFavoriteFolderStandardFlatFieldMetadatas = ({
  createdAt,
  workspaceId,
  standardFieldMetadataIdByObjectAndFieldName,
}: {
  createdAt: Date;
  workspaceId: string;
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
}): Record<
  AllStandardObjectFieldName<'favoriteFolder'>,
  FlatFieldMetadata
> => ({
  // Base fields from BaseWorkspaceEntity
  id: createStandardFieldFlatMetadata({
    objectName: 'favoriteFolder',
    workspaceId,
    options: {
      fieldName: 'id',
      type: FieldMetadataType.UUID,
      label: 'Id',
      description: 'Id',
      icon: 'Icon123',
      isSystem: true,
      isNullable: false,
      isUIReadOnly: true,
      defaultValue: 'uuid',
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  createdAt: createStandardFieldFlatMetadata({
    objectName: 'favoriteFolder',
    workspaceId,
    options: {
      fieldName: 'createdAt',
      type: FieldMetadataType.DATE_TIME,
      label: 'Creation date',
      description: 'Creation date',
      icon: 'IconCalendar',
      isNullable: false,
      isUIReadOnly: true,
      defaultValue: 'now',
      settings: { displayFormat: 'RELATIVE' },
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  updatedAt: createStandardFieldFlatMetadata({
    objectName: 'favoriteFolder',
    workspaceId,
    options: {
      fieldName: 'updatedAt',
      type: FieldMetadataType.DATE_TIME,
      label: 'Last update',
      description: 'Last time the record was changed',
      icon: 'IconCalendarClock',
      isNullable: false,
      isUIReadOnly: true,
      defaultValue: 'now',
      settings: { displayFormat: 'RELATIVE' },
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  deletedAt: createStandardFieldFlatMetadata({
    objectName: 'favoriteFolder',
    workspaceId,
    options: {
      fieldName: 'deletedAt',
      type: FieldMetadataType.DATE_TIME,
      label: 'Deleted at',
      description: 'Date when the record was deleted',
      icon: 'IconCalendarMinus',
      isNullable: true,
      isUIReadOnly: true,
      settings: { displayFormat: 'RELATIVE' },
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),

  // FavoriteFolder-specific fields
  position: createStandardFieldFlatMetadata({
    objectName: 'favoriteFolder',
    workspaceId,
    options: {
      fieldName: 'position',
      type: FieldMetadataType.NUMBER,
      label: 'Position',
      description: 'Favorite folder position',
      icon: 'IconList',
      isSystem: true,
      isNullable: false,
      defaultValue: 0,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  name: createStandardFieldFlatMetadata({
    objectName: 'favoriteFolder',
    workspaceId,
    options: {
      fieldName: 'name',
      type: FieldMetadataType.TEXT,
      label: 'Name',
      description: 'Name of the favorite folder',
      icon: 'IconText',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),

  // Relation fields
  favorites: createStandardRelationFieldFlatMetadata({
    objectName: 'favoriteFolder',
    workspaceId,
    options: {
      fieldName: 'favorites',
      label: 'Favorites',
      description: 'Favorites in this folder',
      icon: 'IconHeart',
      isNullable: false,
      createdAt,
      targetObjectName: 'favorite',
      targetFieldName: 'favoriteFolder',
      settings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
});
