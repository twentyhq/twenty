import { msg } from '@lingui/core/macro';
import { DateDisplayFormat, FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import {
  type CreateStandardFieldArgs,
  createStandardFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import { InboundEventLedgerSourceSystem } from 'src/modules/executive-search/standard-objects/enums/inbound-event-ledger-source-system.enum';
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
    id: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'id',
        type: FieldMetadataType.UUID,
        label: i18nLabel(msg`Id`),
        description: i18nLabel(msg`Id`),
        icon: 'Icon123',
        isSystem: true,
        isNullable: false,
        isUIEditable: false,
        defaultValue: 'uuid',
      },
    }),
    createdAt: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'createdAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(msg`Creation date`),
        description: i18nLabel(msg`Creation date`),
        icon: 'IconCalendar',
        isSystem: true,
        isNullable: false,
        isUIEditable: false,
        defaultValue: 'now',
        settings: { displayFormat: DateDisplayFormat.RELATIVE },
      },
    }),
    updatedAt: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'updatedAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(msg`Last update`),
        description: i18nLabel(msg`Last time the record was changed`),
        icon: 'IconCalendarClock',
        isSystem: true,
        isNullable: false,
        isUIEditable: false,
        defaultValue: 'now',
        settings: { displayFormat: DateDisplayFormat.RELATIVE },
      },
    }),
    deletedAt: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'deletedAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(msg`Deleted at`),
        description: i18nLabel(msg`Date when the record was deleted`),
        icon: 'IconCalendarMinus',
        isSystem: true,
        isNullable: true,
        isUIEditable: false,
        settings: { displayFormat: DateDisplayFormat.RELATIVE },
      },
    }),
    createdBy: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'createdBy',
        type: FieldMetadataType.ACTOR,
        label: i18nLabel(msg`Created by`),
        description: i18nLabel(msg`The creator of the record`),
        icon: 'IconCreativeCommonsSa',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: {
          source: "'MANUAL'",
          name: "'System'",
          workspaceMemberId: null,
        },
      },
    }),
    updatedBy: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'updatedBy',
        type: FieldMetadataType.ACTOR,
        label: i18nLabel(msg`Updated by`),
        description: i18nLabel(
          msg`The workspace member who last updated the record`,
        ),
        icon: 'IconUserCircle',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: {
          source: "'MANUAL'",
          name: "'System'",
          workspaceMemberId: null,
        },
      },
    }),
    position: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'position',
        type: FieldMetadataType.POSITION,
        label: i18nLabel(msg`Position`),
        description: i18nLabel(msg`Outbound event ledger record position`),
        icon: 'IconHierarchy2',
        isSystem: true,
        isNullable: false,
        defaultValue: 0,
      },
    }),
    searchVector: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'searchVector',
        type: FieldMetadataType.TS_VECTOR,
        label: i18nLabel(msg`Search vector`),
        description: i18nLabel(msg`Field used for full-text search`),
        icon: 'IconUser',
        isSystem: true,
        isNullable: true,
      },
    }),
    eventId: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'eventId',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(msg`Event ID`),
        description: i18nLabel(msg`Unique event identifier`),
        icon: 'IconHash',
        isNullable: false,
        isUIEditable: false,
      },
    }),
    eventType: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'eventType',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(msg`Event Type`),
        description: i18nLabel(msg`Type of event`),
        icon: 'IconTag',
        isNullable: false,
        isUIEditable: false,
      },
    }),
    eventVersion: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'eventVersion',
        type: FieldMetadataType.NUMBER,
        label: i18nLabel(msg`Event Version`),
        description: i18nLabel(msg`Event schema version`),
        icon: 'IconVersions',
        isNullable: false,
        isUIEditable: false,
      },
    }),
    sourceSystem: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'sourceSystem',
        type: FieldMetadataType.SELECT,
        label: i18nLabel(msg`Source System`),
        description: i18nLabel(msg`System that originated the event`),
        icon: 'IconPlug',
        isNullable: false,
        isUIEditable: false,
        defaultValue: `'${InboundEventLedgerSourceSystem.DIRECTUS}'`,
        options: [
          {
            id: '2a850e5c-125a-4bc2-bbc0-b174b96f684f',
            value: InboundEventLedgerSourceSystem.DIRECTUS,
            label: i18nLabel(msg`Directus`),
            position: 0,
            color: 'green',
          },
          {
            id: 'f223bf53-b0b1-4176-aaf6-55f80814e3cc',
            value: InboundEventLedgerSourceSystem.TWENTY,
            label: i18nLabel(msg`Twenty`),
            position: 1,
            color: 'blue',
          },
        ],
      },
    }),
    sourceCollection: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'sourceCollection',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(msg`Source Collection`),
        description: i18nLabel(msg`Source collection/table name`),
        icon: 'IconTable',
        isNullable: false,
        isUIEditable: false,
      },
    }),
    sourceRecordId: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'sourceRecordId',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(msg`Source Record ID`),
        description: i18nLabel(msg`Source record identifier`),
        icon: 'IconId',
        isNullable: false,
        isUIEditable: false,
      },
    }),
    sourceHash: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'sourceHash',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(msg`Source Hash`),
        description: i18nLabel(msg`Source record content hash`),
        icon: 'IconFingerprint',
        isNullable: true,
        isUIEditable: false,
      },
    }),
    sourceUpdatedAt: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'sourceUpdatedAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(msg`Source Updated At`),
        description: i18nLabel(msg`Timestamp from the source system`),
        icon: 'IconCalendarClock',
        isNullable: true,
        isUIEditable: false,
      },
    }),
    workspaceKey: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'workspaceKey',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(msg`Workspace Key`),
        description: i18nLabel(msg`Target workspace identifier key`),
        icon: 'IconBuildingStore',
        isNullable: false,
        isUIEditable: false,
      },
    }),
    correlationId: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'correlationId',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(msg`Correlation ID`),
        description: i18nLabel(msg`Correlation identifier for event chains`),
        icon: 'IconArrowsShuffle',
        isNullable: false,
        isUIEditable: false,
      },
    }),
    causationId: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'causationId',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(msg`Causation ID`),
        description: i18nLabel(msg`Causation identifier for event chains`),
        icon: 'IconArrowUpRight',
        isNullable: true,
        isUIEditable: false,
      },
    }),
    idempotencyKey: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'idempotencyKey',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(msg`Idempotency Key`),
        description: i18nLabel(msg`Key ensuring idempotent processing`),
        icon: 'IconLock',
        isNullable: false,
        isUIEditable: false,
      },
    }),
    occurredAt: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'occurredAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(msg`Occurred At`),
        description: i18nLabel(msg`When the event occurred`),
        icon: 'IconCalendarEvent',
        isNullable: false,
        isUIEditable: false,
      },
    }),
    payload: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'payload',
        type: FieldMetadataType.RAW_JSON,
        label: i18nLabel(msg`Payload`),
        description: i18nLabel(msg`Event payload data`),
        icon: 'IconJson',
        isNullable: true,
        isUIEditable: false,
      },
    }),
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
  };
};
