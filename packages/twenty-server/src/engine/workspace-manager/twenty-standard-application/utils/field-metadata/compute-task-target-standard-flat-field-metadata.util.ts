import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import {
  type CreateStandardFieldArgs,
  createStandardFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-relation-field-flat-metadata.util';

export const buildTaskTargetStandardFlatFieldMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardFieldMetadataIdByObjectAndFieldName,
  dependencyFlatEntityMaps,
  twentyStandardApplicationId,
}: Omit<CreateStandardFieldArgs<'taskTarget'>, 'context'>): Record<
  AllStandardObjectFieldName<'taskTarget'>,
  FlatFieldMetadata
> => ({
  // Base fields from BaseWorkspaceEntity
  id: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'id',
      type: FieldMetadataType.UUID,
      label: 'Id',
      description: 'Id',
      icon: 'Icon123',
      isSystem: true,
      isNullable: false,
      isUIReadOnly: true,
      defaultValue: 'uuid',
    },
    standardFieldMetadataIdByObjectAndFieldName,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  createdAt: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
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
    },
    standardFieldMetadataIdByObjectAndFieldName,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  updatedAt: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
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
    },
    standardFieldMetadataIdByObjectAndFieldName,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  deletedAt: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
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
    },
    standardFieldMetadataIdByObjectAndFieldName,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),

  // Relation fields
  task: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
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
    objectName,
    workspaceId,
    context: {
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
    objectName,
    workspaceId,
    context: {
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
    objectName,
    workspaceId,
    context: {
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
    objectName,
    workspaceId,
    context: {
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
