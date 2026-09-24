import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { msg } from '@lingui/core/macro';
import {
  FieldMetadataType,
  MetadataWritability,
  RelationType,
} from 'twenty-shared/types';
import { STANDARD_RELATION_FIELD_PROPERTIES_BY_RELATION_OBJECT } from 'src/engine/metadata-modules/object-metadata/constants/standard-relation-field-properties.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  type CreateStandardFieldArgs,
  createStandardFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-relation-field-flat-metadata.util';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

export const buildAgentChatThreadStandardFlatFieldMetadatas = (
  args: Omit<
    CreateStandardFieldArgs<'agentChatThread', FieldMetadataType>,
    'context'
  >,
): Record<
  AllStandardObjectFieldName<'agentChatThread'>,
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
  userWorkspaceId: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'userWorkspaceId',
        type: FieldMetadataType.UUID,
        label: i18nLabel(
          msg({ message: 'User Workspace ID', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'User Workspace ID',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconId',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  title: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'title',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Title', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Title', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconText',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.OPEN,
    isAuditLogged: false,
  },
  totalInputTokens: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'totalInputTokens',
        type: FieldMetadataType.NUMBER,
        label: i18nLabel(
          msg({
            message: 'Total Input Tokens',
            context: 'fieldMetadata.label',
          }),
        ),
        description: i18nLabel(
          msg({
            message: 'Total Input Tokens',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconNumber',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: 0,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  totalOutputTokens: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'totalOutputTokens',
        type: FieldMetadataType.NUMBER,
        label: i18nLabel(
          msg({
            message: 'Total Output Tokens',
            context: 'fieldMetadata.label',
          }),
        ),
        description: i18nLabel(
          msg({
            message: 'Total Output Tokens',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconNumber',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: 0,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  contextWindowTokens: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'contextWindowTokens',
        type: FieldMetadataType.NUMBER,
        label: i18nLabel(
          msg({
            message: 'Context Window Tokens',
            context: 'fieldMetadata.label',
          }),
        ),
        description: i18nLabel(
          msg({
            message: 'Context Window Tokens',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconNumber',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  conversationSize: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'conversationSize',
        type: FieldMetadataType.NUMBER,
        label: i18nLabel(
          msg({ message: 'Conversation Size', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Conversation Size',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconNumber',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: 0,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  totalInputCredits: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'totalInputCredits',
        type: FieldMetadataType.NUMERIC,
        label: i18nLabel(
          msg({
            message: 'Total Input Credits',
            context: 'fieldMetadata.label',
          }),
        ),
        description: i18nLabel(
          msg({
            message: 'Total Input Credits',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconCoin',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: "'0'",
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  totalOutputCredits: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'totalOutputCredits',
        type: FieldMetadataType.NUMERIC,
        label: i18nLabel(
          msg({
            message: 'Total Output Credits',
            context: 'fieldMetadata.label',
          }),
        ),
        description: i18nLabel(
          msg({
            message: 'Total Output Credits',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconCoin',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: "'0'",
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  totalCacheReadTokens: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'totalCacheReadTokens',
        type: FieldMetadataType.NUMERIC,
        label: i18nLabel(
          msg({
            message: 'Total Cache Read Tokens',
            context: 'fieldMetadata.label',
          }),
        ),
        description: i18nLabel(
          msg({
            message: 'Total Cache Read Tokens',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconNumber',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: "'0'",
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  totalCacheCreationTokens: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'totalCacheCreationTokens',
        type: FieldMetadataType.NUMERIC,
        label: i18nLabel(
          msg({
            message: 'Total Cache Creation Tokens',
            context: 'fieldMetadata.label',
          }),
        ),
        description: i18nLabel(
          msg({
            message: 'Total Cache Creation Tokens',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconNumber',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: "'0'",
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  activeStreamId: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'activeStreamId',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Active Stream ID', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Active Stream ID',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconText',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  pendingQuestionMessageId: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'pendingQuestionMessageId',
        type: FieldMetadataType.UUID,
        label: i18nLabel(
          msg({
            message: 'Pending Question Message ID',
            context: 'fieldMetadata.label',
          }),
        ),
        description: i18nLabel(
          msg({
            message: 'Pending Question Message ID',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconId',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  lastStreamError: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'lastStreamError',
        type: FieldMetadataType.RAW_JSON,
        label: i18nLabel(
          msg({ message: 'Last Stream Error', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Last Stream Error',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconCode',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
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
  archivedAt: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'archivedAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({ message: 'Archived At', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Archived At', context: 'fieldMetadata.description' }),
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
  turns: {
    ...createStandardRelationFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'turns',
        type: FieldMetadataType.RELATION,
        label: i18nLabel(
          msg({ message: 'Turns', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Turns', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconRelationOneToMany',
        isUIEditable: false,
        isNullable: true,
        targetObjectName: 'agentTurn',
        targetFieldName: 'thread',
        morphId: null,
        settings: {
          relationType: RelationType.ONE_TO_MANY,
          joinColumnName: null,
        },
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  messages: {
    ...createStandardRelationFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'messages',
        type: FieldMetadataType.RELATION,
        label: i18nLabel(
          msg({ message: 'Messages', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Messages', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconRelationOneToMany',
        isUIEditable: false,
        isNullable: true,
        targetObjectName: 'agentMessage',
        targetFieldName: 'thread',
        morphId: null,
        settings: {
          relationType: RelationType.ONE_TO_MANY,
          joinColumnName: null,
        },
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  attachments: {
    ...createStandardRelationFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'attachments',
        type: FieldMetadataType.RELATION,
        label: i18nLabel(
          STANDARD_RELATION_FIELD_PROPERTIES_BY_RELATION_OBJECT.attachment
            .label,
        ),
        description: i18nLabel(
          msg({
            message: 'Attachments linked to the chat thread',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: STANDARD_RELATION_FIELD_PROPERTIES_BY_RELATION_OBJECT.attachment
          .icon,
        isUIEditable: false,
        isNullable: true,
        isSystemSideEffect: true,
        targetObjectName: 'attachment',
        targetFieldName: 'targetAgentChatThread',
        morphId: null,
        settings: {
          relationType: RelationType.ONE_TO_MANY,
        },
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
});
