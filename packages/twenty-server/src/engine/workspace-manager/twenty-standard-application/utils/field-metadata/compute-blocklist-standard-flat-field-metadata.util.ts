import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { createStandardFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-relation-field-flat-metadata.util';
import { type StandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-field-metadata-id-by-object-and-field-name.util';

export const buildBlocklistStandardFlatFieldMetadatas = ({
  createdAt,
  workspaceId,
  standardFieldMetadataIdByObjectAndFieldName,
}: {
  createdAt: Date;
  workspaceId: string;
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
}): Record<AllStandardObjectFieldName<'blocklist'>, FlatFieldMetadata> => ({
  // Base fields from BaseWorkspaceEntity
  id: createStandardFieldFlatMetadata({
    objectName: 'blocklist',
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
    objectName: 'blocklist',
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
    objectName: 'blocklist',
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
    objectName: 'blocklist',
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

  // Blocklist-specific fields
  handle: createStandardFieldFlatMetadata({
    objectName: 'blocklist',
    workspaceId,
    options: {
      fieldName: 'handle',
      type: FieldMetadataType.TEXT,
      label: 'Handle',
      description: 'Handle',
      icon: 'IconAt',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),

  // Relation fields
  workspaceMember: createStandardRelationFieldFlatMetadata({
    objectName: 'blocklist',
    workspaceId,
    options: {
      fieldName: 'workspaceMember',
      label: 'WorkspaceMember',
      description: 'WorkspaceMember',
      icon: 'IconCircleUser',
      isNullable: false,
      createdAt,
      targetObjectName: 'workspaceMember',
      targetFieldName: 'blocklist',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.SET_NULL,
        joinColumnName: 'workspaceMemberId',
      },
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
});
