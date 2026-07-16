import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import {
  type CreateStandardFieldArgs,
  createStandardFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { buildEventLedgerCommonFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/compute-event-ledger-shared-flat-field-metadata.util';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import { OutboundEventLedgerStatus } from 'src/modules/executive-search/standard-objects/enums/outbound-event-ledger-status.enum';

export const buildOutboundEventLedgerStandardFlatFieldMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps,
  twentyStandardApplicationId,
}: Omit<
  CreateStandardFieldArgs<'outboundEventLedger', FieldMetadataType>,
  'context'
>): Record<
  AllStandardObjectFieldName<'outboundEventLedger'>,
  FlatFieldMetadata
> => {
  const base = {
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
    objectName,
    workspaceId,
  };

  return {
    ...buildEventLedgerCommonFields(base),
    status: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'status',
        type: FieldMetadataType.SELECT,
        label: i18nLabel(msg`Status`),
        description: i18nLabel(msg`Delivery status`),
        icon: 'IconProgress',
        isNullable: false,
        isUIEditable: false,
        defaultValue: `'${OutboundEventLedgerStatus.PENDING}'`,
        options: [
          {
            id: '2c928f2e-98d7-4229-b8e6-91a38e66c1fa',
            value: OutboundEventLedgerStatus.PENDING,
            label: i18nLabel(msg`Pending`),
            position: 0,
            color: 'sky',
          },
          {
            id: 'a6453d08-788b-49a1-ada0-a7696e262fb2',
            value: OutboundEventLedgerStatus.SENDING,
            label: i18nLabel(msg`Sending`),
            position: 1,
            color: 'orange',
          },
          {
            id: 'fa8c7c29-ac7b-4d7a-a965-836894ec9266',
            value: OutboundEventLedgerStatus.DELIVERED,
            label: i18nLabel(msg`Delivered`),
            position: 2,
            color: 'green',
          },
          {
            id: 'bb0836d8-8dc6-46a5-9da1-629c539f2a30',
            value: OutboundEventLedgerStatus.FAILED,
            label: i18nLabel(msg`Failed`),
            position: 3,
            color: 'red',
          },
          {
            id: '715a3509-1f0d-43d0-be1a-872e7a74563f',
            value: OutboundEventLedgerStatus.DEAD_LETTERED,
            label: i18nLabel(msg`Dead Lettered`),
            position: 4,
            color: 'gray',
          },
        ],
      },
    }),
    statusMessage: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'statusMessage',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(msg`Status Message`),
        description: i18nLabel(msg`Status detail message`),
        icon: 'IconMessage',
        isNullable: true,
        isUIEditable: false,
      },
    }),
    deliveryAttempts: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'deliveryAttempts',
        type: FieldMetadataType.NUMBER,
        label: i18nLabel(msg`Delivery Attempts`),
        description: i18nLabel(msg`Number of delivery attempts`),
        icon: 'IconRepeat',
        isNullable: false,
        isUIEditable: false,
        defaultValue: 0,
      },
    }),
    lastDeliveryAttemptAt: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'lastDeliveryAttemptAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(msg`Last Delivery Attempt At`),
        description: i18nLabel(msg`When the last delivery attempt occurred`),
        icon: 'IconCalendarClock',
        isNullable: true,
        isUIEditable: false,
      },
    }),
    deliveredAt: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'deliveredAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(msg`Delivered At`),
        description: i18nLabel(msg`When the event was delivered`),
        icon: 'IconCalendarCheck',
        isNullable: true,
        isUIEditable: false,
      },
    }),
  } as Record<
    AllStandardObjectFieldName<'outboundEventLedger'>,
    FlatFieldMetadata
  >;
};
