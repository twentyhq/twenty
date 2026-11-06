import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { UNREAD_AUTH_CONTEXT } from 'src/engine/permissions/__tests__/framework/build-principals.util';
import { type RecordAccessScenario } from 'src/engine/permissions/__tests__/framework/record-access-scenario.type';
import {
  RECORD_OPERATIONS,
  type RecordOperation,
} from 'src/engine/permissions/__tests__/framework/record-operations.constant';
import { WORKSPACE_ID } from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import { buildScenarioServices } from 'src/engine/permissions/__tests__/framework/build-permission-services.util';
import { buildStoredRecords } from 'src/engine/permissions/__tests__/framework/stored-records.util';
import {
  SWEEP_RECORDS,
  SWEEP_SCENARIOS,
} from 'src/engine/permissions/__tests__/sweep/sweep-dimensions.util';
import { buildPermissionsCondition } from 'src/engine/permissions/internal/combine/utils/build-permissions-condition.util';
import { findGrantedRecordIds } from 'src/engine/permissions/internal/combine/utils/find-granted-record-ids.util';
import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';

const SOME_RECORDS_QUESTIONS = {
  select: 'canReadSomeRecords',
  update: 'canUpdateSomeRecords',
  'soft-delete': 'canSoftDeleteSomeRecords',
  restore: 'canSoftDeleteSomeRecords',
  delete: 'canDestroySomeRecords',
} as const;

const STORED_RECORDS = buildStoredRecords(SWEEP_RECORDS);
const EVENTS = STORED_RECORDS.records.map(
  (record) =>
    ({
      recordId: record.id,
      properties: { after: record },
    }) as unknown as ObjectRecordEvent,
);

export type SweepEntry = {
  scenario: RecordAccessScenario;
  operationType: RecordOperation;
  grantedRecordIds: Set<string>;
  sqlCondition: SqlCondition | boolean;
  canReachSomeRecords: boolean;
  readableEventRecordIds: Set<string> | undefined;
};

export const describeSweepEntry = ({
  scenario,
  operationType,
}: Pick<SweepEntry, 'scenario' | 'operationType'>) =>
  `${operationType} / ${JSON.stringify(scenario)}`;

const computeScenarioEntries = async (
  scenario: RecordAccessScenario,
): Promise<SweepEntry[]> => {
  const { services, principals, metadataMaps, flatObjectMetadata } =
    await buildScenarioServices({ scenario, storedRecords: STORED_RECORDS });
  const readableEventRecordIds =
    await services.recordPermissionsService.findReadableEventRecordIds({
      authContext: UNREAD_AUTH_CONTEXT,
      eventBatch: {
        workspaceId: WORKSPACE_ID,
        objectMetadata: flatObjectMetadata,
        events: EVENTS,
      } as never,
    });
  const entries: SweepEntry[] = [];

  for (const operationType of RECORD_OPERATIONS) {
    const request = {
      principals,
      metadataMaps,
      flatObjectMetadata,
      operationType,
    };

    entries.push({
      scenario,
      operationType,
      grantedRecordIds: await findGrantedRecordIds({
        ...request,
        records: STORED_RECORDS.records,
        context: {
          shouldIgnoreSoftDeleteDefaultFilter: false,
          fetchRecordShares: async () => STORED_RECORDS.shares,
          findPrivateRecordStates: async () =>
            STORED_RECORDS.privateRecordStates,
        },
      }),
      sqlCondition: buildPermissionsCondition({
        ...request,
        recordShareTableExpression: 'record_share',
      }),
      canReachSomeRecords: await services.recordPermissionsService[
        SOME_RECORDS_QUESTIONS[operationType]
      ]({ principals, objectMetadataId: flatObjectMetadata.id }),
      readableEventRecordIds:
        operationType === 'select' ? readableEventRecordIds : undefined,
    });
  }

  return entries;
};

export const computeSweep = async (): Promise<SweepEntry[]> => {
  const entries: SweepEntry[] = [];

  for (const scenario of SWEEP_SCENARIOS) {
    entries.push(...(await computeScenarioEntries(scenario)));
  }

  return entries;
};
