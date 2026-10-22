import { randomUUID } from 'node:crypto';

import { executeToolThroughMcp } from 'test/integration/ai/utils/execute-tool-through-mcp.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const ROW_LEVEL_PERMISSION_CACHE_KEYS = [
  'flatRoleMaps',
  'flatRowLevelPermissionPredicateMaps',
  'flatRowLevelPermissionPredicateGroupMaps',
] as const;

const countAdminRowLevelPermissionRules = async (adminRoleId: string) => {
  const [{ predicateCount, groupCount }] =
    await globalThis.testDataSource.query(
      `SELECT
         (SELECT count(*)::int FROM core."rowLevelPermissionPredicate" WHERE "roleId" = $1) AS "predicateCount",
         (SELECT count(*)::int FROM core."rowLevelPermissionPredicateGroup" WHERE "roleId" = $1) AS "groupCount"`,
      [adminRoleId],
    );

  return { predicateCount, groupCount };
};

const recomputeRowLevelPermissionCaches = () =>
  getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
    ...ROW_LEVEL_PERMISSION_CACHE_KEYS,
  ]);

describe('Row Level Permission Predicate upsert on a non-editable role should fail', () => {
  let adminRoleId: string;
  let companyObjectMetadataId: string;
  let companyNameFieldMetadataId: string;

  beforeAll(async () => {
    const adminRole = await findOneRoleByLabel({ label: 'Admin' });

    expect(adminRole.isEditable).toBe(false);
    adminRoleId = adminRole.id;

    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: `
        id
        nameSingular
        fieldsList {
          id
          name
        }
      `,
    });

    const companyObjectMetadata = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'company',
    );

    jestExpectToBeDefined(companyObjectMetadata);
    companyObjectMetadataId = companyObjectMetadata.id;

    const nameField = companyObjectMetadata.fieldsList?.find(
      (field: { name: string }) => field.name === 'name',
    );

    jestExpectToBeDefined(nameField);
    companyNameFieldMetadataId = nameField.id;
  });

  afterEach(async () => {
    expect(await countAdminRowLevelPermissionRules(adminRoleId)).toEqual({
      predicateCount: 0,
      groupCount: 0,
    });
  });

  it('refuses a new predicate', async () => {
    const { errors } = await upsertRowLevelPermissionPredicates({
      expectToFail: true,
      input: {
        roleId: adminRoleId,
        objectMetadataId: companyObjectMetadataId,
        predicates: [
          {
            fieldMetadataId: companyNameFieldMetadataId,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
            value: 'Apple',
          },
        ],
        predicateGroups: [],
      },
    });

    expect(JSON.stringify(errors)).toMatch(/not editable/i);
  });

  it('refuses a new predicate group', async () => {
    const { errors } = await upsertRowLevelPermissionPredicates({
      expectToFail: true,
      input: {
        roleId: adminRoleId,
        objectMetadataId: companyObjectMetadataId,
        predicates: [],
        predicateGroups: [
          {
            objectMetadataId: companyObjectMetadataId,
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
          },
        ],
      },
    });

    expect(JSON.stringify(errors)).toMatch(/not editable/i);
  });

  it('refuses a new predicate through the upsert_row_level_permission_rules tool', async () => {
    const output = await executeToolThroughMcp({
      toolName: 'upsert_row_level_permission_rules',
      toolArguments: {
        roleId: adminRoleId,
        objectMetadataId: companyObjectMetadataId,
        predicates: [
          {
            fieldMetadataId: companyNameFieldMetadataId,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
            value: 'Apple',
          },
        ],
        predicateGroups: [],
      },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(output.success).toBe(false);
    expect(output.error).toMatch(/not editable/i);
  });

  describe('with a predicate already on the role', () => {
    const existingPredicateId = randomUUID();

    beforeEach(async () => {
      const [{ workspaceCustomApplicationId }] =
        await globalThis.testDataSource.query(
          `SELECT "workspaceCustomApplicationId" FROM core.workspace WHERE id = $1`,
          [SEED_APPLE_WORKSPACE_ID],
        );

      await globalThis.testDataSource.query(
        `INSERT INTO core."rowLevelPermissionPredicate"
           (id, "universalIdentifier", "applicationId", "workspaceId", "roleId", "objectMetadataId", "fieldMetadataId", operand, value)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'CONTAINS', '"Apple"')`,
        [
          existingPredicateId,
          randomUUID(),
          workspaceCustomApplicationId,
          SEED_APPLE_WORKSPACE_ID,
          adminRoleId,
          companyObjectMetadataId,
          companyNameFieldMetadataId,
        ],
      );
      await recomputeRowLevelPermissionCaches();
    });

    afterEach(async () => {
      await globalThis.testDataSource.query(
        `DELETE FROM core."rowLevelPermissionPredicate" WHERE id = $1`,
        [existingPredicateId],
      );
      await recomputeRowLevelPermissionCaches();
    });

    it('refuses updating it', async () => {
      const { errors } = await upsertRowLevelPermissionPredicates({
        expectToFail: true,
        input: {
          roleId: adminRoleId,
          objectMetadataId: companyObjectMetadataId,
          predicates: [
            {
              id: existingPredicateId,
              fieldMetadataId: companyNameFieldMetadataId,
              operand: RowLevelPermissionPredicateOperand.CONTAINS,
              value: 'Microsoft',
            },
          ],
          predicateGroups: [],
        },
      });

      expect(JSON.stringify(errors)).toMatch(/not editable/i);

      const [predicate] = await globalThis.testDataSource.query(
        `SELECT value FROM core."rowLevelPermissionPredicate" WHERE id = $1`,
        [existingPredicateId],
      );

      expect(predicate.value).toBe('Apple');
    });

    it('still lets it be removed', async () => {
      const { data } = await upsertRowLevelPermissionPredicates({
        expectToFail: false,
        input: {
          roleId: adminRoleId,
          objectMetadataId: companyObjectMetadataId,
          predicates: [],
          predicateGroups: [],
        },
      });

      expect(data.upsertRowLevelPermissionPredicates.predicates).toEqual([]);
    });
  });
});
