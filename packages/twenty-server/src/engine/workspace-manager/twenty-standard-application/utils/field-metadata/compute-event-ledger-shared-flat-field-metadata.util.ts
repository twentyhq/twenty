import { msg } from '@lingui/core/macro';
import { DateDisplayFormat, FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  type CreateStandardFieldArgs,
  createStandardFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import { InboundEventLedgerSourceSystem } from 'src/modules/executive-search/standard-objects/enums/inbound-event-ledger-source-system.enum';

type EventLedgerObjectName = 'inboundEventLedger' | 'outboundEventLedger';

export type EventLedgerCommonFieldName =
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'createdBy'
  | 'updatedBy'
  | 'position'
  | 'searchVector'
  | 'eventId'
  | 'eventType'
  | 'eventVersion'
  | 'sourceSystem'
  | 'sourceCollection'
  | 'sourceRecordId'
  | 'sourceHash'
  | 'sourceUpdatedAt'
  | 'workspaceKey'
  | 'correlationId'
  | 'causationId'
  | 'idempotencyKey'
  | 'occurredAt'
  | 'payload';

/**
 * Shared system + event-envelope fields that are identical between
 * inboundEventLedger and outboundEventLedger.
 */
export const buildEventLedgerCommonFields = <O extends EventLedgerObjectName>(
  base: Omit<
    CreateStandardFieldArgs<O, FieldMetadataType>,
    'context'
  >,
): Record<EventLedgerCommonFieldName, FlatFieldMetadata> => ({
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
      description: i18nLabel(msg`Event ledger record position`),
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
});
