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

export const buildAgentMessagePartStandardFlatFieldMetadatas = (
  args: Omit<
    CreateStandardFieldArgs<'agentMessagePart', FieldMetadataType>,
    'context'
  >,
): Record<
  AllStandardObjectFieldName<'agentMessagePart'>,
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
  orderIndex: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'orderIndex',
        type: FieldMetadataType.NUMBER,
        label: i18nLabel(
          msg({ message: 'Order Index', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Order Index', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconNumber',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  type: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'type',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Type', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Type', context: 'fieldMetadata.description' }),
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
  textContent: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'textContent',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Text Content', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Text Content',
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
  reasoningContent: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'reasoningContent',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Reasoning Content', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Reasoning Content',
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
  toolName: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'toolName',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Tool Name', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Tool Name', context: 'fieldMetadata.description' }),
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
  toolCallId: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'toolCallId',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Tool Call ID', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Tool Call ID',
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
  toolInput: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'toolInput',
        type: FieldMetadataType.RAW_JSON,
        label: i18nLabel(
          msg({ message: 'Tool Input', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Tool Input', context: 'fieldMetadata.description' }),
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
  toolOutput: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'toolOutput',
        type: FieldMetadataType.RAW_JSON,
        label: i18nLabel(
          msg({ message: 'Tool Output', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Tool Output', context: 'fieldMetadata.description' }),
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
  state: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'state',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'State', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'State', context: 'fieldMetadata.description' }),
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
  providerExecuted: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'providerExecuted',
        type: FieldMetadataType.BOOLEAN,
        label: i18nLabel(
          msg({ message: 'Provider Executed', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Provider Executed',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconToggleLeft',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  errorMessage: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'errorMessage',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Error Message', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Error Message',
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
  errorDetails: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'errorDetails',
        type: FieldMetadataType.RAW_JSON,
        label: i18nLabel(
          msg({ message: 'Error Details', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Error Details',
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
  sourceUrlSourceId: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'sourceUrlSourceId',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({
            message: 'Source URL Source ID',
            context: 'fieldMetadata.label',
          }),
        ),
        description: i18nLabel(
          msg({
            message: 'Source URL Source ID',
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
  sourceUrlUrl: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'sourceUrlUrl',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Source URL URL', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Source URL URL',
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
  sourceUrlTitle: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'sourceUrlTitle',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Source URL Title', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Source URL Title',
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
  sourceDocumentSourceId: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'sourceDocumentSourceId',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({
            message: 'Source Document Source ID',
            context: 'fieldMetadata.label',
          }),
        ),
        description: i18nLabel(
          msg({
            message: 'Source Document Source ID',
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
  sourceDocumentMediaType: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'sourceDocumentMediaType',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({
            message: 'Source Document Media Type',
            context: 'fieldMetadata.label',
          }),
        ),
        description: i18nLabel(
          msg({
            message: 'Source Document Media Type',
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
  sourceDocumentTitle: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'sourceDocumentTitle',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({
            message: 'Source Document Title',
            context: 'fieldMetadata.label',
          }),
        ),
        description: i18nLabel(
          msg({
            message: 'Source Document Title',
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
  sourceDocumentFilename: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'sourceDocumentFilename',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({
            message: 'Source Document Filename',
            context: 'fieldMetadata.label',
          }),
        ),
        description: i18nLabel(
          msg({
            message: 'Source Document Filename',
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
  fileFilename: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'fileFilename',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'File Filename', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'File Filename',
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
  fileId: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'fileId',
        type: FieldMetadataType.UUID,
        label: i18nLabel(
          msg({ message: 'File ID', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'File ID', context: 'fieldMetadata.description' }),
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
  providerMetadata: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'providerMetadata',
        type: FieldMetadataType.RAW_JSON,
        label: i18nLabel(
          msg({ message: 'Provider Metadata', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Provider Metadata',
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
          msg({ message: 'Message', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconRelationOneToMany',
        isUIEditable: false,
        isNullable: false,
        targetObjectName: 'agentMessage',
        targetFieldName: 'parts',
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
});
