import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type PrincipalSlot } from 'src/engine/permissions/__tests__/framework/given-principals.util';
import { OTHER_MEMBER_ID } from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import { ROLE_FILTERS } from 'src/engine/permissions/__tests__/framework/role-filters.constant';

export type RecordFixture = {
  isPrivate?: boolean;
  createdBy?: string;
  share?: { principalId: string; accessLevel: RecordShareAccessLevel };
  outsideFilterOf?: PrincipalSlot[];
};

export type StoredRecordFixture = RecordFixture & { id: string };

export const EVERYONE = EVERYONE_PRINCIPAL_ID;

export const buildStoredRecords = (fixtures: StoredRecordFixture[]) => ({
  records: fixtures.map(({ id, outsideFilterOf = [] }) => ({
    id,
    deletedAt: null,
    ...Object.fromEntries(
      ROLE_FILTERS.map(
        ({ principalSlot, fieldName, matchingValue, outsideValue }) => [
          fieldName,
          outsideFilterOf.includes(principalSlot)
            ? outsideValue
            : matchingValue,
        ],
      ),
    ),
  })),
  shares: fixtures.flatMap(({ id, share }) =>
    isDefined(share) ? [{ ...share, recordId: id }] : [],
  ),
  privateRecordStates: new Map(
    fixtures.map((fixture) => [
      fixture.id,
      {
        isPrivate: fixture.isPrivate ?? false,
        createdByWorkspaceMemberId: fixture.createdBy ?? OTHER_MEMBER_ID,
      },
    ]),
  ),
});

export type StoredRecords = ReturnType<typeof buildStoredRecords>;
