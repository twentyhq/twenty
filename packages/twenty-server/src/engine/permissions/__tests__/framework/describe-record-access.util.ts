import { type RecordShareAccessLevel } from 'twenty-shared/types';

import {
  RECORD_OPERATIONS,
  type RecordAccessWorld,
  type RecordOperation,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';
import { resolveWorld } from 'src/engine/permissions/__tests__/framework/resolve-world.util';
import {
  buildStoredRecords,
  type RecordFixture,
} from 'src/engine/permissions/__tests__/framework/stored-records.util';
import { findGrantedRecordIds } from 'src/engine/permissions/internal/combine/utils/find-granted-record-ids.util';

const RECORD_ID = 'record-id';

export type RecordAccessCase = {
  it: string;
  given?: Partial<RecordAccessWorld>;
  record?: RecordFixture;
  hypotheticalShareAccessLevel?: RecordShareAccessLevel;
  grants: RecordOperation[];
};

type RecordAccessCases = {
  given: RecordAccessWorld;
  cases: RecordAccessCase[];
};

const findGrantedOperations = async ({
  world,
  record = {},
  hypotheticalShareAccessLevel,
}: {
  world: RecordAccessWorld;
  record?: RecordFixture;
  hypotheticalShareAccessLevel?: RecordShareAccessLevel;
}) => {
  const storedRecords = buildStoredRecords([{ ...record, id: RECORD_ID }]);
  const { principals, metadataMaps, flatObjectMetadata } = await resolveWorld({
    world,
    storedRecords,
  });
  const grantedOperations: RecordOperation[] = [];

  for (const operationType of RECORD_OPERATIONS) {
    const grantedRecordIds = await findGrantedRecordIds({
      principals,
      metadataMaps,
      flatObjectMetadata,
      operationType,
      hypotheticalRecordShareAccessLevel: hypotheticalShareAccessLevel,
      records: storedRecords.records,
      context: {
        shouldIgnoreSoftDeleteDefaultFilter: false,
        fetchRecordShares: async () => storedRecords.shares,
        findPrivateRecordStates: async () => storedRecords.privateRecordStates,
      },
    });

    if (grantedRecordIds.has(RECORD_ID)) {
      grantedOperations.push(operationType);
    }
  }

  return grantedOperations;
};

const registerCases = ({
  name,
  given,
  cases,
  registerTest,
}: RecordAccessCases & {
  name: string;
  registerTest: (title: string, run: () => Promise<void>) => void;
}) =>
  describe(name, () => {
    for (const recordAccessCase of cases) {
      registerTest(recordAccessCase.it, async () => {
        const grantedOperations = await findGrantedOperations({
          world: { ...given, ...recordAccessCase.given },
          record: recordAccessCase.record,
          hypotheticalShareAccessLevel:
            recordAccessCase.hypotheticalShareAccessLevel,
        });

        expect(grantedOperations).toEqual(
          RECORD_OPERATIONS.filter((operation) =>
            recordAccessCase.grants.includes(operation),
          ),
        );
      });
    }
  });

export const describeRecordAccess = (
  recordAccessCases: RecordAccessCases & { name: string },
) => registerCases({ ...recordAccessCases, registerTest: it });

export const describeKnownRecordAccessDifferences = (
  recordAccessCases: RecordAccessCases & { name: string },
) => registerCases({ ...recordAccessCases, registerTest: it.failing });
