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

export const buildAgentMessageStandardFlatFieldMetadatas = (
  args: Omit<
    CreateStandardFieldArgs<'agentMessage', FieldMetadataType>,
    'context'
  >,
): Record<AllStandardObjectFieldName<'agentMessage'>, FlatFieldMetadata> => ({
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
          msg({ message: 'Agent ID', context: 'fieldMetadata.description' }),
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
  role: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'role',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Role', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Role', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconText',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  status: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'status',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Status', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Status', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconText',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: "'sent'",
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  isHidden: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'isHidden',
        type: FieldMetadataType.BOOLEAN,
        label: i18nLabel(
          msg({ message: 'Is Hidden', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Is Hidden', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconToggleLeft',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: false,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  processedAt: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'processedAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({ message: 'Processed At', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Processed At',
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
          msg({ message: 'Thread', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconRelationOneToMany',
        isUIEditable: false,
        isNullable: false,
        targetObjectName: 'agentChatThread',
        targetFieldName: 'messages',
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
  turn: {
    ...createStandardRelationFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'turn',
        type: FieldMetadataType.RELATION,
        label: i18nLabel(
          msg({ message: 'Turn', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Turn', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconRelationOneToMany',
        isUIEditable: false,
        isNullable: true,
        targetObjectName: 'agentTurn',
        targetFieldName: 'messages',
        morphId: null,
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          onDelete: RelationOnDeleteAction.CASCADE,
          joinColumnName: 'turnId',
        },
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  parts: {
    ...createStandardRelationFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'parts',
        type: FieldMetadataType.RELATION,
        label: i18nLabel(
          msg({ message: 'Parts', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Parts', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconRelationOneToMany',
        isUIEditable: false,
        isNullable: true,
        targetObjectName: 'agentMessagePart',
        targetFieldName: 'message',
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
});
