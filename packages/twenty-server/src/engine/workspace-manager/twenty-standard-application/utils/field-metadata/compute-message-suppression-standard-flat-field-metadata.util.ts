import { msg } from '@lingui/core/macro';
import { FieldMetadataType, MetadataWritability } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import {
  type CreateStandardFieldArgs,
  createStandardFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

export const buildMessageSuppressionStandardFlatFieldMetadatas = (
  args: Omit<
    CreateStandardFieldArgs<'messageSuppression', FieldMetadataType>,
    'context'
  >,
): Record<
  AllStandardObjectFieldName<'messageSuppression'>,
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
  emailAddress: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'emailAddress',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Email Address', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Email Address',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconMail',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  reason: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'reason',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Reason', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Reason', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconBan',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  source: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'source',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Source', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Source', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconPlugConnected',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  providerEventId: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'providerEventId',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Provider Event ID', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Provider Event ID',
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
  unsubscribeTopicId: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'unsubscribeTopicId',
        type: FieldMetadataType.UUID,
        label: i18nLabel(
          msg({
            message: 'Unsubscribe Topic ID',
            context: 'fieldMetadata.label',
          }),
        ),
        description: i18nLabel(
          msg({
            message: 'Unsubscribe Topic ID',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconTags',
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
});
