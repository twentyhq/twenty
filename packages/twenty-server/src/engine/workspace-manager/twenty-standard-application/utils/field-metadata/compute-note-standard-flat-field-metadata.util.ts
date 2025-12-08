import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { createStandardFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-relation-field-flat-metadata.util';
import { type StandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-field-metadata-id-by-object-and-field-name.util';

export const buildNoteStandardFlatFieldMetadatas = ({
  createdAt,
  workspaceId,
  standardFieldMetadataIdByObjectAndFieldName,
}: {
  createdAt: Date;
  workspaceId: string;
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
}): Record<AllStandardObjectFieldName<'note'>, FlatFieldMetadata> => ({
  // Base fields from BaseWorkspaceEntity
  id: createStandardFieldFlatMetadata({
    objectName: 'note',
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
    objectName: 'note',
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
      settings: {
        displayFormat: 'RELATIVE',
      },
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  updatedAt: createStandardFieldFlatMetadata({
    objectName: 'note',
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
      settings: {
        displayFormat: 'RELATIVE',
      },
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  deletedAt: createStandardFieldFlatMetadata({
    objectName: 'note',
    workspaceId,
    options: {
      fieldName: 'deletedAt',
      type: FieldMetadataType.DATE_TIME,
      label: 'Deleted at',
      description: 'Date when the record was deleted',
      icon: 'IconCalendarMinus',
      isNullable: true,
      isUIReadOnly: true,
      settings: {
        displayFormat: 'RELATIVE',
      },
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),

  // Note-specific fields
  position: createStandardFieldFlatMetadata({
    objectName: 'note',
    workspaceId,
    options: {
      fieldName: 'position',
      type: FieldMetadataType.POSITION,
      label: 'Position',
      description: 'Note record position',
      icon: 'IconHierarchy2',
      isSystem: true,
      isNullable: false,
      defaultValue: 0,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  title: createStandardFieldFlatMetadata({
    objectName: 'note',
    workspaceId,
    options: {
      fieldName: 'title',
      type: FieldMetadataType.TEXT,
      label: 'Title',
      description: 'Note title',
      icon: 'IconNotes',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  body: createStandardFieldFlatMetadata({
    objectName: 'note',
    workspaceId,
    options: {
      fieldName: 'body',
      type: FieldMetadataType.TEXT,
      label: 'Body (deprecated)',
      description: 'Note body (deprecated - use bodyV2)',
      icon: 'IconFilePencil',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  bodyV2: createStandardFieldFlatMetadata({
    objectName: 'note',
    workspaceId,
    options: {
      fieldName: 'bodyV2',
      type: FieldMetadataType.RICH_TEXT_V2,
      label: 'Body',
      description: 'Note body',
      icon: 'IconFilePencil',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  createdBy: createStandardFieldFlatMetadata({
    objectName: 'note',
    workspaceId,
    options: {
      fieldName: 'createdBy',
      type: FieldMetadataType.ACTOR,
      label: 'Created by',
      description: 'The creator of the record',
      icon: 'IconCreativeCommonsSa',
      isUIReadOnly: true,
      isNullable: false,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  searchVector: createStandardFieldFlatMetadata({
    objectName: 'note',
    workspaceId,
    options: {
      fieldName: 'searchVector',
      type: FieldMetadataType.TS_VECTOR,
      label: 'Search vector',
      description: 'Field used for full-text search',
      icon: 'IconUser',
      isSystem: true,
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),

  // Relation fields
  noteTargets: createStandardRelationFieldFlatMetadata({
    objectName: 'note',
    workspaceId,
    options: {
      fieldName: 'noteTargets',
      label: 'Relations',
      description: 'Note targets',
      icon: 'IconArrowUpRight',
      isSystem: true,
      isNullable: true,
      createdAt,
      targetObjectName: 'noteTarget',
      targetFieldName: 'note',
      settings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  attachments: createStandardRelationFieldFlatMetadata({
    objectName: 'note',
    workspaceId,
    options: {
      fieldName: 'attachments',
      label: 'Attachments',
      description: 'Note attachments',
      icon: 'IconFileImport',
      isSystem: true,
      isNullable: true,
      createdAt,
      targetObjectName: 'attachment',
      targetFieldName: 'note',
      settings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  timelineActivities: createStandardRelationFieldFlatMetadata({
    objectName: 'note',
    workspaceId,
    options: {
      fieldName: 'timelineActivities',
      label: 'Timeline Activities',
      description: 'Timeline Activities linked to the note.',
      icon: 'IconTimelineEvent',
      isSystem: true,
      isNullable: true,
      createdAt,
      targetObjectName: 'timelineActivity',
      targetFieldName: 'note',
      settings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  favorites: createStandardRelationFieldFlatMetadata({
    objectName: 'note',
    workspaceId,
    options: {
      fieldName: 'favorites',
      label: 'Favorites',
      description: 'Favorites linked to the note',
      icon: 'IconHeart',
      isSystem: true,
      isNullable: false,
      createdAt,
      targetObjectName: 'favorite',
      targetFieldName: 'note',
      settings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
});
