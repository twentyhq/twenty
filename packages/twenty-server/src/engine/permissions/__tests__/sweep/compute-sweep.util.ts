import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { UNREAD_AUTH_CONTEXT } from 'src/engine/permissions/__tests__/framework/build-principals.util';
import {
  RECORD_OPERATIONS,
  type RecordAccessWorld,
  type RecordOperation,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';
import { WORKSPACE_ID } from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import { resolveWorld } from 'src/engine/permissions/__tests__/framework/resolve-world.util';
import { buildStoredRecords } from 'src/engine/permissions/__tests__/framework/stored-records.util';
import {
  SWEEP_RECORDS,
  SWEEP_WORLDS,
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
  world: RecordAccessWorld;
  operationType: RecordOperation;
  grantedRecordIds: Set<string>;
  sqlCondition: SqlCondition | boolean;
  canReachSomeRecords: boolean;
  readableEventRecordIds: Set<string> | undefined;
};

export const describeSweepEntry = ({
  world,
  operationType,
}: Pick<SweepEntry, 'world' | 'operationType'>) =>
  `${operationType} / ${JSON.stringify(world)}`;

const computeWorldEntries = async (
  world: RecordAccessWorld,
): Promise<SweepEntry[]> => {
  const { services, principals, metadataMaps, flatObjectMetadata } =
    await resolveWorld({ world, storedRecords: STORED_RECORDS });
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
      world,
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

  for (const world of SWEEP_WORLDS) {
    entries.push(...(await computeWorldEntries(world)));
  }

  return entries;
};
