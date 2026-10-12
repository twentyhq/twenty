import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { msg } from '@lingui/core/macro';
import {
  FieldActorSource,
  FieldMetadataType,
  MetadataWritability,
  RelationType,
  RelationOnDeleteAction,
} from 'twenty-shared/types';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  type CreateStandardFieldArgs,
  createStandardFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-relation-field-flat-metadata.util';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

export const buildAgentTurnStandardFlatFieldMetadatas = (
  args: Omit<
    CreateStandardFieldArgs<'agentTurn', FieldMetadataType>,
    'context'
  >,
): Record<AllStandardObjectFieldName<'agentTurn'>, FlatFieldMetadata> => ({
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
        icon: 'IconProgressCheck',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: `'${AgentTurnStatus.COMPLETED}'`,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  error: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'error',
        type: FieldMetadataType.RAW_JSON,
        label: i18nLabel(
          msg({ message: 'Error', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Error', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconAlertTriangle',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  startedAt: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'startedAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({ message: 'Started At', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Started At', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconCalendarClock',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  endedAt: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'endedAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({ message: 'Ended At', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Ended At', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconCalendarClock',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  modelId: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'modelId',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Model ID', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Model ID', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconBrain',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  inputTokens: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'inputTokens',
        type: FieldMetadataType.NUMBER,
        label: i18nLabel(
          msg({ message: 'Input Tokens', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Input Tokens',
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
  outputTokens: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'outputTokens',
        type: FieldMetadataType.NUMBER,
        label: i18nLabel(
          msg({ message: 'Output Tokens', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Output Tokens',
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
  cacheReadTokens: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'cacheReadTokens',
        type: FieldMetadataType.NUMERIC,
        label: i18nLabel(
          msg({ message: 'Cache Read Tokens', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Cache Read Tokens',
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
  cacheCreationTokens: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'cacheCreationTokens',
        type: FieldMetadataType.NUMERIC,
        label: i18nLabel(
          msg({
            message: 'Cache Creation Tokens',
            context: 'fieldMetadata.label',
          }),
        ),
        description: i18nLabel(
          msg({
            message: 'Cache Creation Tokens',
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
  inputCredits: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'inputCredits',
        type: FieldMetadataType.NUMERIC,
        label: i18nLabel(
          msg({ message: 'Input Credits', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Input Credits',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconCoin',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  outputCredits: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'outputCredits',
        type: FieldMetadataType.NUMERIC,
        label: i18nLabel(
          msg({ message: 'Output Credits', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Output Credits',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconCoin',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  createdBy: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'createdBy',
        type: FieldMetadataType.ACTOR,
        label: i18nLabel(
          msg({ message: 'Created by', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Created by', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconCreativeCommonsSa',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: {
          source: `'${FieldActorSource.SYSTEM}'`,
          name: "'System'",
          workspaceMemberId: null,
        },
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
        targetFieldName: 'turns',
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
        targetFieldName: 'turn',
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
