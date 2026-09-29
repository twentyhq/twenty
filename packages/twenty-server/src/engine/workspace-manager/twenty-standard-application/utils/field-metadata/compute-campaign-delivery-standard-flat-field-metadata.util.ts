import { msg } from '@lingui/core/macro';
import { FieldMetadataType, MetadataWritability } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import {
  type CreateStandardFieldArgs,
  createStandardFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

export const buildCampaignDeliveryStandardFlatFieldMetadatas = (
  args: Omit<
    CreateStandardFieldArgs<'campaignDelivery', FieldMetadataType>,
    'context'
  >,
): Record<
  AllStandardObjectFieldName<'campaignDelivery'>,
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
  campaignId: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'campaignId',
        type: FieldMetadataType.UUID,
        label: i18nLabel(
          msg({ message: 'Campaign ID', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Campaign ID', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconSpeakerphone',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  personId: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'personId',
        type: FieldMetadataType.UUID,
        label: i18nLabel(
          msg({ message: 'Person ID', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Person ID', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconUser',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  recipientEmail: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'recipientEmail',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Recipient Email', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Recipient Email',
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
        icon: 'IconStatusChange',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: "'QUEUED'",
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  skipReason: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'skipReason',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Skip Reason', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Skip Reason', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconPlayerSkipForward',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  failureReason: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'failureReason',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Failure Reason', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Failure Reason',
            context: 'fieldMetadata.description',
          }),
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
  claimToken: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'claimToken',
        type: FieldMetadataType.UUID,
        label: i18nLabel(
          msg({ message: 'Claim Token', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Claim Token', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconKey',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  claimExpiresAt: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'claimExpiresAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({ message: 'Claim Expires At', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Claim Expires At',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconClock',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  providerMessageId: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'providerMessageId',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({
            message: 'Provider Message ID',
            context: 'fieldMetadata.label',
          }),
        ),
        description: i18nLabel(
          msg({
            message: 'Provider Message ID',
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
  sentAt: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'sentAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({ message: 'Sent At', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Sent At', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconSend',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  deliveredAt: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'deliveredAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({ message: 'Delivered At', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Delivered At',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconMailCheck',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  bouncedAt: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'bouncedAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({ message: 'Bounced At', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Bounced At', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconMailX',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  complainedAt: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'complainedAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({ message: 'Complained At', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Complained At',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconMailExclamation',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  rejectedAt: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'rejectedAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({ message: 'Rejected At', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Rejected At', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconMailOff',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  renderingFailedAt: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'renderingFailedAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({
            message: 'Rendering Failed At',
            context: 'fieldMetadata.label',
          }),
        ),
        description: i18nLabel(
          msg({
            message: 'Rendering Failed At',
            context: 'fieldMetadata.description',
          }),
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
