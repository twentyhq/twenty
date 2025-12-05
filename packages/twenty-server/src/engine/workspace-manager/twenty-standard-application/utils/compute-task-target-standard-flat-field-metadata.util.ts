import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { createStandardFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/create-standard-relation-field-flat-metadata.util';
import { type StandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-field-metadata-id-by-object-and-field-name.util';

export const buildTaskTargetStandardFlatFieldMetadatas = ({
  createdAt,
  workspaceId,
  standardFieldMetadataIdByObjectAndFieldName,
}: {
  createdAt: Date;
  workspaceId: string;
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
}): Record<AllStandardObjectFieldName<'taskTarget'>, FlatFieldMetadata> => ({
  // Base fields from BaseWorkspaceEntity
  id: createStandardFieldFlatMetadata({
    objectName: 'taskTarget',
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
    objectName: 'taskTarget',
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
    objectName: 'taskTarget',
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
    objectName: 'taskTarget',
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

  // Relation fields
  task: createStandardRelationFieldFlatMetadata({
    objectName: 'taskTarget',
    workspaceId,
    options: {
      fieldName: 'task',
      label: 'Task',
      description: 'TaskTarget task',
      icon: 'IconCheckbox',
      isNullable: true,
      createdAt,
      targetObjectName: 'task',
      targetFieldName: 'taskTargets',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.SET_NULL,
        joinColumnName: 'taskId',
      },
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  person: createStandardRelationFieldFlatMetadata({
    objectName: 'taskTarget',
    workspaceId,
    options: {
      fieldName: 'person',
      label: 'Person',
      description: 'TaskTarget person',
      icon: 'IconUser',
      isNullable: true,
      createdAt,
      targetObjectName: 'person',
      targetFieldName: 'taskTargets',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.CASCADE,
        joinColumnName: 'personId',
      },
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  company: createStandardRelationFieldFlatMetadata({
    objectName: 'taskTarget',
    workspaceId,
    options: {
      fieldName: 'company',
      label: 'Company',
      description: 'TaskTarget company',
      icon: 'IconBuildingSkyscraper',
      isNullable: true,
      createdAt,
      targetObjectName: 'company',
      targetFieldName: 'taskTargets',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.CASCADE,
        joinColumnName: 'companyId',
      },
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  opportunity: createStandardRelationFieldFlatMetadata({
    objectName: 'taskTarget',
    workspaceId,
    options: {
      fieldName: 'opportunity',
      label: 'Opportunity',
      description: 'TaskTarget opportunity',
      icon: 'IconTargetArrow',
      isNullable: true,
      createdAt,
      targetObjectName: 'opportunity',
      targetFieldName: 'taskTargets',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.CASCADE,
        joinColumnName: 'opportunityId',
      },
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  custom: createStandardRelationFieldFlatMetadata({
    objectName: 'taskTarget',
    workspaceId,
    options: {
      fieldName: 'custom',
      label: 'Custom',
      description: 'TaskTarget custom object',
      icon: 'IconBuildingSkyscraper',
      isNullable: true,
      createdAt,
      // Custom is a dynamic relation
      targetObjectName: 'task',
      targetFieldName: 'taskTargets',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.CASCADE,
        joinColumnName: 'customId',
      },
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
});
