import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import {
  FeatureFlagKey,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type RecomputeRecordAccessGroupsCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1794096521000-recompute-record-access-groups.command';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const SCHEMA = `"${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"`;
const ACCESS_GROUP_TABLE = `${SCHEMA}."accessGroup"`;
const PERSON_TABLE = `${SCHEMA}."person"`;

describe('2-57 workspace command - recompute record access groups (integration)', () => {
  let command: RecomputeRecordAccessGroupsCommand;
  let roleId: string;
  let personId: string;

  const runCommand = (options: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options,
      index: 0,
      total: 1,
      dataSource: global.testDataSource,
    });

  const readPersonAccessGroupIds = async (): Promise<number[] | null> => {
    const [{ accessGroupIds }] = await global.testDataSource.query(
      `SELECT "_accessGroupIds" AS "accessGroupIds" FROM ${PERSON_TABLE} WHERE "id" = $1`,
      [personId],
    );

    return accessGroupIds;
  };

  const clearPersonAccessGroupIds = () =>
    global.testDataSource.query(
      `UPDATE ${PERSON_TABLE} SET "_accessGroupIds" = NULL WHERE "id" = $1`,
      [personId],
    );

  const setAccessGroupsEnabled = (value: boolean) =>
    updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED,
      value,
      expectToFail: false,
    });

  beforeAll(async () => {
    command = getAppProviderByClassName<RecomputeRecordAccessGroupsCommand>(
      'RecomputeRecordAccessGroupsCommand',
    );

    const [{ id: objectMetadataId }] = await global.testDataSource.query(
      `SELECT "id" FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = 'person'`,
      [SEED_APPLE_WORKSPACE_ID],
    );
    const [{ id: jobTitleFieldMetadataId }] = await global.testDataSource.query(
      `SELECT "id" FROM core."fieldMetadata" WHERE "objectMetadataId" = $1 AND "name" = 'jobTitle'`,
      [objectMetadataId],
    );

    [{ id: personId }] = await global.testDataSource.query(
      `SELECT "id" FROM ${PERSON_TABLE} ORDER BY "id" LIMIT 1`,
    );

    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Recompute record access groups',
        description: 'Recompute record access groups',
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });

    roleId = data.createOneRole.id;

    const predicateGroupId = v4();

    await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: {
        roleId,
        objectMetadataId,
        predicateGroups: [
          {
            id: predicateGroupId,
            objectMetadataId,
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
          },
        ],
        predicates: [
          {
            id: v4(),
            fieldMetadataId: jobTitleFieldMetadataId,
            operand: RowLevelPermissionPredicateOperand.IS_NOT_EMPTY,
            value: null,
            rowLevelPermissionPredicateGroupId: predicateGroupId,
          },
        ],
      },
    });
  });

  afterAll(async () => {
    await setAccessGroupsEnabled(false);
    await deleteOneRole({ expectToFail: false, input: { idToDelete: roleId } });
    await waitForAllJobsToFinish();
    await global.testDataSource.query(
      `UPDATE ${PERSON_TABLE} SET "_accessGroupIds" = NULL`,
    );
    await global.testDataSource.query(`DELETE FROM ${ACCESS_GROUP_TABLE}`);
  });

  it('should leave records alone where access groups are off', async () => {
    await clearPersonAccessGroupIds();
    await runCommand();
    await waitForAllJobsToFinish();

    expect(await readPersonAccessGroupIds()).toBeNull();
  });

  it('should recompute records whose groups already exist', async () => {
    await setAccessGroupsEnabled(true);
    await waitForAllJobsToFinish();
    await clearPersonAccessGroupIds();

    await runCommand({ dryRun: true });
    await waitForAllJobsToFinish();

    expect(await readPersonAccessGroupIds()).toBeNull();

    await runCommand();
    await waitForAllJobsToFinish();

    expect((await readPersonAccessGroupIds())?.length).toBeGreaterThan(0);
  });
});
