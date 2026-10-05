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
  evaluations: {
    ...createStandardRelationFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'evaluations',
        type: FieldMetadataType.RELATION,
        label: i18nLabel(
          msg({ message: 'Evaluations', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Evaluations', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconRelationOneToMany',
        isUIEditable: false,
        isNullable: true,
        targetObjectName: 'agentTurnEvaluation',
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
