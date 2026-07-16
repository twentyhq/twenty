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
import { InboundEventLedgerStatus } from 'src/modules/executive-search/standard-objects/enums/inbound-event-ledger-status.enum';

export const buildInboundEventLedgerStandardFlatFieldMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps,
  twentyStandardApplicationId,
}: Omit<
  CreateStandardFieldArgs<'inboundEventLedger', FieldMetadataType>,
  'context'
>): Record<
  AllStandardObjectFieldName<'inboundEventLedger'>,
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
        description: i18nLabel(msg`Processing status`),
        icon: 'IconProgress',
        isNullable: false,
        isUIEditable: false,
        defaultValue: `'${InboundEventLedgerStatus.RECEIVED}'`,
        options: [
          {
            id: 'ee354672-32ab-4560-a338-449293071ffe',
            value: InboundEventLedgerStatus.RECEIVED,
            label: i18nLabel(msg`Received`),
            position: 0,
            color: 'sky',
          },
          {
            id: 'daa0e0d7-d74c-470d-aebb-18a300e9c16f',
            value: InboundEventLedgerStatus.PROCESSING,
            label: i18nLabel(msg`Processing`),
            position: 1,
            color: 'orange',
          },
          {
            id: '078f9c74-f87f-47c8-9931-ed3f1ecb70a3',
            value: InboundEventLedgerStatus.PROCESSED,
            label: i18nLabel(msg`Processed`),
            position: 2,
            color: 'green',
          },
          {
            id: '565b309b-00a9-4301-981f-6cac9207f6b9',
            value: InboundEventLedgerStatus.FAILED,
            label: i18nLabel(msg`Failed`),
            position: 3,
            color: 'red',
          },
          {
            id: '0a264713-80bc-4d41-9d02-e889b8ee58cf',
            value: InboundEventLedgerStatus.DEAD_LETTERED,
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
    processingAttempts: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'processingAttempts',
        type: FieldMetadataType.NUMBER,
        label: i18nLabel(msg`Processing Attempts`),
        description: i18nLabel(msg`Number of processing attempts`),
        icon: 'IconRepeat',
        isNullable: false,
        isUIEditable: false,
        defaultValue: 0,
      },
    }),
    lastAttemptAt: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'lastAttemptAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(msg`Last Attempt At`),
        description: i18nLabel(msg`When the last processing attempt occurred`),
        icon: 'IconCalendarClock',
        isNullable: true,
        isUIEditable: false,
      },
    }),
    processedAt: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'processedAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(msg`Processed At`),
        description: i18nLabel(msg`When the event was processed`),
        icon: 'IconCalendarCheck',
        isNullable: true,
        isUIEditable: false,
      },
    }),
  };
};
