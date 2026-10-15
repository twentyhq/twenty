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

export const buildAgentChatThreadParticipantStandardFlatFieldMetadatas = (
  args: Omit<
    CreateStandardFieldArgs<'agentChatThreadParticipant', FieldMetadataType>,
    'context'
  >,
): Record<
  AllStandardObjectFieldName<'agentChatThreadParticipant'>,
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
  thread: {
    ...createStandardRelationFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'thread',
        type: FieldMetadataType.RELATION,
        label: i18nLabel(
          msg({ message: 'Thread', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Thread this state belongs to',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconMessage',
        isUIEditable: false,
        isNullable: false,
        targetObjectName: 'agentChatThread',
        targetFieldName: 'participants',
        morphId: null,
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          onDelete: RelationOnDeleteAction.CASCADE,
          joinColumnName: 'threadId',
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
            message: 'Workspace member this state belongs to',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconUser',
        isUIEditable: false,
        isNullable: false,
        targetObjectName: 'workspaceMember',
        targetFieldName: 'agentChatThreadParticipants',
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
  lastReadAt: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'lastReadAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({ message: 'Last read at', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Latest activity the member has read up to',
            context: 'fieldMetadata.description',
          }),
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
          msg({ message: 'Archived at', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'When the member archived or snoozed the thread',
            context: 'fieldMetadata.description',
          }),
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
  snoozedUntil: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'snoozedUntil',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({ message: 'Snoozed until', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'When a snoozed thread comes back to the inbox',
            context: 'fieldMetadata.description',
          }),
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
  isSubscribed: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'isSubscribed',
        type: FieldMetadataType.BOOLEAN,
        label: i18nLabel(
          msg({ message: 'Subscribed', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Whether new activity brings the thread back to the inbox',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconBell',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  lastMentionedAt: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'lastMentionedAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({ message: 'Last mentioned at', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'When the member was last mentioned in the thread',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconAt',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
});
