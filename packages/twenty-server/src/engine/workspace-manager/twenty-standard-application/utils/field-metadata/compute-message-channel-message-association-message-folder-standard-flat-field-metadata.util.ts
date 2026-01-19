import {
    DateDisplayFormat,
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

export const buildMessageChannelMessageAssociationMessageFolderStandardFlatFieldMetadatas =
  ({
    now,
    objectName,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
  }: Omit<
    CreateStandardFieldArgs<
      'messageChannelMessageAssociationMessageFolder',
      FieldMetadataType
    >,
    'context'
  >): Record<
    AllStandardObjectFieldName<'messageChannelMessageAssociationMessageFolder'>,
    FlatFieldMetadata
  > => ({
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
      standardObjectMetadataRelatedEntityIds,
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
        settings: { displayFormat: DateDisplayFormat.RELATIVE },
      },
      standardObjectMetadataRelatedEntityIds,
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
        settings: { displayFormat: DateDisplayFormat.RELATIVE },
      },
      standardObjectMetadataRelatedEntityIds,
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
        settings: { displayFormat: DateDisplayFormat.RELATIVE },
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      twentyStandardApplicationId,
      now,
    }),
    messageChannelMessageAssociation: createStandardRelationFieldFlatMetadata({
      objectName,
      workspaceId,
      context: {
        type: FieldMetadataType.RELATION,
        morphId: null,
        fieldName: 'messageChannelMessageAssociation',
        label: 'Message Channel Message Association',
        description: 'Message Channel Message Association',
        icon: 'IconMessage',
        isNullable: false,
        isUIReadOnly: true,
        targetObjectName: 'messageChannelMessageAssociation',
        targetFieldName: 'messageFolders',
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          onDelete: RelationOnDeleteAction.CASCADE,
          joinColumnName: 'messageChannelMessageAssociationId',
        },
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      twentyStandardApplicationId,
      now,
    }),
    messageFolder: createStandardRelationFieldFlatMetadata({
      objectName,
      workspaceId,
      context: {
        type: FieldMetadataType.RELATION,
        morphId: null,
        fieldName: 'messageFolder',
        label: 'Message Folder',
        description: 'Message Folder',
        icon: 'IconFolder',
        isNullable: false,
        isUIReadOnly: true,
        targetObjectName: 'messageFolder',
        targetFieldName: 'messageChannelMessageAssociationMessageFolders',
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          onDelete: RelationOnDeleteAction.CASCADE,
          joinColumnName: 'messageFolderId',
        },
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      twentyStandardApplicationId,
      now,
    }),
  });
