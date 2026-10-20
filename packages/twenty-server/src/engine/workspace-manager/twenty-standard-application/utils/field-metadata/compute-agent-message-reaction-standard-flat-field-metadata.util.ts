import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { msg } from '@lingui/core/macro';
import {
  FieldMetadataType,
  MetadataWritability,
  RelationType,
  RelationOnDeleteAction,
} from 'twenty-shared/types';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  type CreateStandardFieldArgs,
  createStandardFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-relation-field-flat-metadata.util';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

export const buildAgentMessageReactionStandardFlatFieldMetadatas = (
  args: Omit<
    CreateStandardFieldArgs<'agentMessageReaction', FieldMetadataType>,
    'context'
  >,
): Record<
  AllStandardObjectFieldName<'agentMessageReaction'>,
  FlatFieldMetadata
> => ({
  id: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'id',
        type: FieldMetadataType.UUID,
        label: i18nLabel(
          msg({ message: 'ID', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'ID', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconId',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: 'uuid',
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  createdAt: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'createdAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({ message: 'Created At', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Created At', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconCalendar',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: 'now',
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  updatedAt: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'updatedAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({ message: 'Updated At', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Updated At', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconCalendar',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: 'now',
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  deletedAt: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'deletedAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({ message: 'Deleted At', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Deleted At', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconCalendar',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  message: {
    ...createStandardRelationFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'message',
        type: FieldMetadataType.RELATION,
        label: i18nLabel(
          msg({ message: 'Message', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Chat message this reaction is on',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconMessage',
        isUIEditable: false,
        isNullable: false,
        targetObjectName: 'agentMessage',
        targetFieldName: 'reactions',
        morphId: null,
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          onDelete: RelationOnDeleteAction.CASCADE,
          joinColumnName: 'messageId',
        },
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  workspaceMember: {
    ...createStandardRelationFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'workspaceMember',
        type: FieldMetadataType.RELATION,
        label: i18nLabel(
          msg({ message: 'Workspace Member', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message:
              'Workspace member who reacted, empty when an agent or the assistant did',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconUser',
        isUIEditable: false,
        isNullable: true,
        targetObjectName: 'workspaceMember',
        targetFieldName: 'agentMessageReactions',
        morphId: null,
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          onDelete: RelationOnDeleteAction.CASCADE,
          joinColumnName: 'workspaceMemberId',
        },
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  agentId: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'agentId',
        type: FieldMetadataType.UUID,
        label: i18nLabel(
          msg({ message: 'Agent ID', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message:
              'Agent that reacted, empty for members and the chat assistant',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconLego',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  emoji: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'emoji',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Emoji', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Emoji the member reacted with',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconMoodSmile',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
});
