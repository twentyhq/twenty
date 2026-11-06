import { type RecordShareAccessLevel } from 'twenty-shared/types';

import { buildScenarioServices } from 'src/engine/permissions/__tests__/framework/build-permission-services.util';
import { type RecordAccessScenario } from 'src/engine/permissions/__tests__/framework/record-access-scenario.type';
import {
  RECORD_OPERATIONS,
  type RecordOperation,
} from 'src/engine/permissions/__tests__/framework/record-operations.constant';
import {
  buildStoredRecords,
  type RecordFixture,
} from 'src/engine/permissions/__tests__/framework/stored-records.util';
import { findGrantedRecordIds } from 'src/engine/permissions/internal/combine/utils/find-granted-record-ids.util';

const RECORD_ID = 'record-id';

export type RecordAccessCase = Partial<RecordAccessScenario> & {
  it: string;
  record?: RecordFixture;
  hypotheticalShareAccessLevel?: RecordShareAccessLevel;
  grants: RecordOperation[];
};

type RecordAccessCases = RecordAccessScenario & {
  name: string;
  cases: RecordAccessCase[];
};

const findGrantedOperations = async ({
  scenario,
  record = {},
  hypotheticalShareAccessLevel,
}: {
  scenario: RecordAccessScenario;
  record?: RecordFixture;
  hypotheticalShareAccessLevel?: RecordShareAccessLevel;
}) => {
  const storedRecords = buildStoredRecords([{ ...record, id: RECORD_ID }]);
  const { principals, metadataMaps, flatObjectMetadata } =
    await buildScenarioServices({ scenario, storedRecords });
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
  recordAccessCases: { name, cases, ...sharedScenario },
  registerTest,
}: {
  recordAccessCases: RecordAccessCases;
  registerTest: (title: string, run: () => Promise<void>) => void;
}) =>
  describe(name, () => {
    for (const {
      it: title,
      record,
      hypotheticalShareAccessLevel,
      grants,
      ...caseScenario
    } of cases) {
      registerTest(title, async () => {
        const grantedOperations = await findGrantedOperations({
          scenario: { ...sharedScenario, ...caseScenario },
          record,
          hypotheticalShareAccessLevel,
        });

        expect(grantedOperations).toEqual(
          RECORD_OPERATIONS.filter((operation) => grants.includes(operation)),
        );
      });
    }
  });

export const describeRecordAccess = (recordAccessCases: RecordAccessCases) =>
  registerCases({ recordAccessCases, registerTest: it });

export const describeKnownRecordAccessDifferences = (
  recordAccessCases: RecordAccessCases,
) => registerCases({ recordAccessCases, registerTest: it.failing });
