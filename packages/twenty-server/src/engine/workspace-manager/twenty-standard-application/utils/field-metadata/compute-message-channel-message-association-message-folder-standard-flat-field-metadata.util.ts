import { msg } from '@lingui/core/macro';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
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
        label: i18nLabel(
          msg({ message: `Id`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: `Id`, context: 'fieldMetadata.description' }),
        ),
        icon: 'Icon123',
        isSystem: true,
        isNullable: false,
        isUIEditable: false,
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
        label: i18nLabel(
          msg({ message: `Creation date`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Creation date`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconCalendar',
        isSystem: true,
        isNullable: false,
        isUIEditable: false,
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
        label: i18nLabel(
          msg({ message: `Last update`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Last time the record was changed`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconCalendarClock',
        isSystem: true,
        isNullable: false,
        isUIEditable: false,
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
        label: i18nLabel(
          msg({ message: `Deleted at`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Date when the record was deleted`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconCalendarMinus',
        isSystem: true,
        isNullable: true,
        isUIEditable: false,
        settings: { displayFormat: DateDisplayFormat.RELATIVE },
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      twentyStandardApplicationId,
      now,
    }),
    createdBy: createStandardFieldFlatMetadata({
      objectName,
      workspaceId,
      context: {
        fieldName: 'createdBy',
        type: FieldMetadataType.ACTOR,
        label: i18nLabel(
          msg({ message: `Created by`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `The creator of the record`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconCreativeCommonsSa',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: {
          source: "'MANUAL'",
          name: "'System'",
          workspaceMemberId: null,
        },
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      twentyStandardApplicationId,
      now,
    }),
    updatedBy: createStandardFieldFlatMetadata({
      objectName,
      workspaceId,
      context: {
        fieldName: 'updatedBy',
        type: FieldMetadataType.ACTOR,
        label: i18nLabel(
          msg({ message: `Updated by`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `The workspace member who last updated the record`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconUserCircle',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: {
          source: "'MANUAL'",
          name: "'System'",
          workspaceMemberId: null,
        },
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      twentyStandardApplicationId,
      now,
    }),
    position: createStandardFieldFlatMetadata({
      objectName,
      workspaceId,
      context: {
        fieldName: 'position',
        type: FieldMetadataType.POSITION,
        label: i18nLabel(
          msg({ message: `Position`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Message channel message association message folder record position`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconHierarchy2',
        isSystem: true,
        isNullable: false,
        defaultValue: 0,
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      twentyStandardApplicationId,
      now,
    }),
    searchVector: createStandardFieldFlatMetadata({
      objectName,
      workspaceId,
      context: {
        fieldName: 'searchVector',
        type: FieldMetadataType.TS_VECTOR,
        label: i18nLabel(
          msg({ message: `Search vector`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Field used for full-text search`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconUser',
        isSystem: true,
        isNullable: true,
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
        label: i18nLabel(
          msg({
            message: `Message Channel Message Association`,
            context: 'fieldMetadata.label',
          }),
        ),
        description: i18nLabel(
          msg({
            message: `Message Channel Message Association`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconMessage',
        isNullable: false,
        isUIEditable: false,
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
    messageFolderId: createStandardFieldFlatMetadata({
      objectName,
      workspaceId,
      context: {
        fieldName: 'messageFolderId',
        type: FieldMetadataType.UUID,
        label: i18nLabel(
          msg({ message: `Message Folder`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Message Folder`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconFolder',
        isNullable: false,
        isUIEditable: false,
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      twentyStandardApplicationId,
      now,
    }),
  });
