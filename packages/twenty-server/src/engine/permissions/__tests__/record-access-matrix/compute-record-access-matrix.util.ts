import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { type ObjectRecordsOperationType } from 'twenty-shared/types';

import { buildMatrixServices } from 'src/engine/permissions/__tests__/record-access-matrix/build-matrix-services.util';
import {
  type MatrixActor,
  type RoleGrant,
} from 'src/engine/permissions/__tests__/record-access-matrix/record-access-matrix.model';
import {
  buildMatrixCacheValues,
  FLAT_OBJECT_METADATA,
  MATRIX_ACTORS,
  MATRIX_PRIVATE_RECORD_STATES,
  MATRIX_RECORD_SHARES,
  MATRIX_ROWS,
  toRecord,
  WORKSPACE_ID,
} from 'src/engine/permissions/__tests__/record-access-matrix/record-access-matrix.world';
import { buildPermissionsCondition } from 'src/engine/permissions/internal/combine/utils/build-permissions-condition.util';
import { findGrantedRecordIds } from 'src/engine/permissions/internal/combine/utils/find-granted-record-ids.util';
import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';

const ROLE_GRANTS: RoleGrant[] = ['none', 'rowLevel', 'allRecords'];
export const OPERATION_TYPES = [
  'select',
  'update',
  'soft-delete',
  'restore',
  'delete',
] as const satisfies ObjectRecordsOperationType[];
const SOME_RECORDS_QUESTIONS = {
  select: 'canReadSomeRecords',
  update: 'canUpdateSomeRecords',
  'soft-delete': 'canSoftDeleteSomeRecords',
  restore: 'canSoftDeleteSomeRecords',
  delete: 'canDestroySomeRecords',
} as const;

const RECORDS = MATRIX_ROWS.map(toRecord);
const EVENTS = MATRIX_ROWS.map(
  (row) =>
    ({
      recordId: row.id,
      properties: { after: toRecord(row) },
    }) as unknown as ObjectRecordEvent,
);

export type MatrixEntry = {
  actor: MatrixActor;
  operationType: (typeof OPERATION_TYPES)[number];
  isSharingEnabled: boolean;
  mainRoleGrant: RoleGrant;
  limitingRoleGrant: RoleGrant;
  grantedRecordIds: Set<string>;
  sqlCondition: SqlCondition | boolean;
  canReachSomeRecords: boolean;
  readableEventRecordIds: Set<string> | undefined;
};

export const describeEntry = ({
  actor,
  operationType,
  isSharingEnabled,
  mainRoleGrant,
  limitingRoleGrant,
}: Omit<
  MatrixEntry,
  | 'grantedRecordIds'
  | 'sqlCondition'
  | 'canReachSomeRecords'
  | 'readableEventRecordIds'
>) =>
  `${actor.name} / ${operationType} / sharing ${isSharingEnabled ? 'on' : 'off'} / main ${mainRoleGrant} / limiting ${limitingRoleGrant}`;

export const computeMatrix = async (): Promise<MatrixEntry[]> => {
  const entries: MatrixEntry[] = [];

  for (const isSharingEnabled of [true, false]) {
    for (const mainRoleGrant of ROLE_GRANTS) {
      for (const limitingRoleGrant of ROLE_GRANTS) {
        const services = buildMatrixServices(
          buildMatrixCacheValues({
            mainRoleGrant,
            limitingRoleGrant,
            isSharingEnabled,
          }),
        );
        const metadataMaps = await services.permissionsMetadataMapsService.load(
          { workspaceId: WORKSPACE_ID },
        );

        for (const { actor, authContext } of MATRIX_ACTORS) {
          if (!actor.hasLimitingRole && limitingRoleGrant !== 'none') {
            continue;
          }

          const principals =
            await services.principalPermissionsService.buildPermissionsPrincipalsOrThrow(
              { authContext },
            );

          for (const operationType of OPERATION_TYPES) {
            const request = {
              principals,
              metadataMaps,
              flatObjectMetadata: FLAT_OBJECT_METADATA,
              operationType,
            };

            entries.push({
              actor,
              operationType,
              isSharingEnabled,
              mainRoleGrant,
              limitingRoleGrant,
              grantedRecordIds: await findGrantedRecordIds({
                ...request,
                records: RECORDS,
                context: {
                  shouldIgnoreSoftDeleteDefaultFilter: false,
                  fetchRecordShares: async () => MATRIX_RECORD_SHARES,
                  findPrivateRecordStates: async () =>
                    MATRIX_PRIVATE_RECORD_STATES,
                },
              }),
              sqlCondition: buildPermissionsCondition({
                ...request,
                recordShareTableExpression: 'record_share',
              }),
              canReachSomeRecords: await services.recordPermissionsService[
                SOME_RECORDS_QUESTIONS[operationType]
              ]({ principals, objectMetadataId: FLAT_OBJECT_METADATA.id }),
              readableEventRecordIds:
                operationType === 'select'
                  ? await services.recordPermissionsService.findReadableEventRecordIds(
                      {
                        authContext,
                        eventBatch: {
                          workspaceId: WORKSPACE_ID,
                          objectMetadata: FLAT_OBJECT_METADATA,
                          events: EVENTS,
                        } as never,
                      },
                    )
                  : undefined,
            });
          }
        }
      }
    }
  }

  return entries;
};
