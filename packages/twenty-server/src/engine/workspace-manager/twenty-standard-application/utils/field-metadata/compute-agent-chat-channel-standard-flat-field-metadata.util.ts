import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { msg } from '@lingui/core/macro';
import {
  FieldMetadataType,
  MetadataWritability,
  RelationType,
} from 'twenty-shared/types';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  type CreateStandardFieldArgs,
  createStandardFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-relation-field-flat-metadata.util';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

export const buildAgentChatChannelStandardFlatFieldMetadatas = (
  args: Omit<
    CreateStandardFieldArgs<'agentChatChannel', FieldMetadataType>,
    'context'
  >,
): Record<
  AllStandardObjectFieldName<'agentChatChannel'>,
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
  name: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'name',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Name', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Name of the channel',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconHash',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: "''",
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  icon: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'icon',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Icon', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Icon of the channel',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconIcons',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  color: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'color',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Color', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Color of the channel icon',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconColorSwatch',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  visibility: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'visibility',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Visibility', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message:
              'Whether every member can join the channel or only the members added to it',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconLock',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: "'PUBLIC'",
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  threads: {
    ...createStandardRelationFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'threads',
        type: FieldMetadataType.RELATION,
        label: i18nLabel(
          msg({ message: 'Chats', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Chats triaged in the channel',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconMessage',
        isUIEditable: false,
        isNullable: true,
        targetObjectName: 'agentChatThread',
        targetFieldName: 'channel',
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
  members: {
    ...createStandardRelationFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'members',
        type: FieldMetadataType.RELATION,
        label: i18nLabel(
          msg({ message: 'Members', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Members who joined the channel',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconUsers',
        isUIEditable: false,
        isNullable: true,
        targetObjectName: 'agentChatChannelMember',
        targetFieldName: 'channel',
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
