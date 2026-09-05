import {
  SHARING_RULE_PREDICATE_GQL_FIELDS,
  SHARING_RULE_PREDICATE_GROUP_GQL_FIELDS,
} from 'test/integration/constants/sharing-rule-gql-fields.constants';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { createSharingRule } from 'test/integration/metadata/suites/sharing-rule/utils/create-sharing-rule.util';
import { deleteSharingRule } from 'test/integration/metadata/suites/sharing-rule/utils/delete-sharing-rule.util';
import { findSharingRules } from 'test/integration/metadata/suites/sharing-rule/utils/find-sharing-rules.util';
import { updateSharingRule } from 'test/integration/metadata/suites/sharing-rule/utils/update-sharing-rule.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const RULE_PREDICATE_GQL_FIELDS = {
  predicates: SHARING_RULE_PREDICATE_GQL_FIELDS,
  predicateGroups: SHARING_RULE_PREDICATE_GROUP_GQL_FIELDS,
};

const countPredicateRows = async (sharingRuleId: string): Promise<number> => {
  const rows = await globalThis.testDataSource.query(
    `SELECT count(*)::int AS count FROM core."rowLevelPermissionPredicate"
     WHERE "sharingRuleId" = $1 AND "workspaceId" = $2`,
    [sharingRuleId, SEED_APPLE_WORKSPACE_ID],
  );

  return rows[0].count;
};

describe('Sharing rule CRUD', () => {
  let objectMetadataId: string;
  let nameFieldMetadataId: string;
  let roleId: string;
  let sharingRuleId: string | undefined;

  beforeAll(async () => {
    const { data: objectData } = await createOneObjectMetadata({
      expectToFail: false,
      input: getMockCreateObjectInput({
        nameSingular: 'sharedListing',
        namePlural: 'sharedListings',
        labelSingular: 'Shared Listing',
        labelPlural: 'Shared Listings',
      }),
    });

    objectMetadataId = objectData.createOneObject.id;

    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: `
        id
        fieldsList {
          id
          name
        }
      `,
    });

    const nameField = objects
      .find((object) => object.id === objectMetadataId)
      ?.fieldsList?.find((field) => field.name === 'name');

    jestExpectToBeDefined(nameField);
    nameFieldMetadataId = nameField.id;

    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Sharing rule grantee role',
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });

    roleId = roleData.createOneRole.id;
  });

  afterAll(async () => {
    if (isDefined(sharingRuleId)) {
      await deleteSharingRule({
        expectToFail: false,
        input: { id: sharingRuleId },
      });
    }

    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: roleId },
    });

    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: objectMetadataId },
    });
  });

  it('creates a rule without criteria, lists it and updates its access level', async () => {
    const { data, errors } = await createSharingRule({
      expectToFail: false,
      input: {
        objectMetadataId,
        name: 'Everyone reads listings',
        granteePrincipalType: RecordSharePrincipalType.EVERYONE,
        accessLevel: RecordShareAccessLevel.READ,
      },
    });

    expect(errors).toBeUndefined();
    expect(data.createSharingRule).toMatchObject({
      id: expect.any(String),
      universalIdentifier: expect.any(String),
      objectMetadataId,
      name: 'Everyone reads listings',
      description: null,
      granteePrincipalType: RecordSharePrincipalType.EVERYONE,
      granteePrincipalId: null,
      granteeRoleId: null,
      accessLevel: RecordShareAccessLevel.READ,
      isActive: true,
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    });

    sharingRuleId = data.createSharingRule.id;

    const { data: listData } = await findSharingRules({
      expectToFail: false,
      input: { objectMetadataId },
    });

    expect(listData.sharingRules).toHaveLength(1);
    expect(listData.sharingRules[0].id).toBe(sharingRuleId);

    const { data: updateData, errors: updateErrors } = await updateSharingRule({
      expectToFail: false,
      input: {
        id: sharingRuleId,
        accessLevel: RecordShareAccessLevel.READ_WRITE,
        granteePrincipalType: RecordSharePrincipalType.ROLE,
        granteeRoleId: roleId,
      },
    });

    expect(updateErrors).toBeUndefined();
    expect(updateData.updateSharingRule).toMatchObject({
      id: sharingRuleId,
      accessLevel: RecordShareAccessLevel.READ_WRITE,
      granteePrincipalType: RecordSharePrincipalType.ROLE,
      granteeRoleId: roleId,
    });
  });

  it('attaches criteria to the rule through upsertRowLevelPermissionPredicates', async () => {
    jestExpectToBeDefined(sharingRuleId);

    const { data, errors } = await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      gqlFields: RULE_PREDICATE_GQL_FIELDS,
      input: {
        sharingRuleId,
        objectMetadataId,
        predicates: [
          {
            fieldMetadataId: nameFieldMetadataId,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
            value: 'Shared',
          },
        ],
        predicateGroups: [],
      },
    });

    expect(errors).toBeUndefined();
    expect(data.upsertRowLevelPermissionPredicates.predicates).toHaveLength(1);
    expect(data.upsertRowLevelPermissionPredicates.predicates[0]).toMatchObject(
      {
        fieldMetadataId: nameFieldMetadataId,
        objectMetadataId,
        roleId: null,
        sharingRuleId,
      },
    );

    const { data: listData } = await findSharingRules({
      expectToFail: false,
      input: { objectMetadataId },
    });

    expect(listData.sharingRules[0].rowLevelPermissionPredicates).toHaveLength(
      1,
    );
    expect(await countPredicateRows(sharingRuleId)).toBe(1);
  });

  it('refuses a predicate upsert naming both a role and a sharing rule', async () => {
    jestExpectToBeDefined(sharingRuleId);

    const { errors } = await upsertRowLevelPermissionPredicates({
      expectToFail: true,
      gqlFields: RULE_PREDICATE_GQL_FIELDS,
      input: {
        roleId,
        sharingRuleId,
        objectMetadataId,
        predicates: [],
        predicateGroups: [],
      },
    });

    expect(errors).toEqual([
      expect.objectContaining({
        extensions: expect.objectContaining({
          code: 'BAD_USER_INPUT',
          subCode: 'INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA',
        }),
      }),
    ]);
  });

  it('refuses a rule granting a role without naming the role', async () => {
    const { errors } = await createSharingRule({
      expectToFail: true,
      input: {
        objectMetadataId,
        name: 'Role without a role',
        granteePrincipalType: RecordSharePrincipalType.ROLE,
        accessLevel: RecordShareAccessLevel.READ,
      },
    });

    expect(errors).toEqual([
      expect.objectContaining({
        extensions: expect.objectContaining({
          code: expect.stringContaining('METADATA_VALIDATION'),
        }),
      }),
    ]);
  });

  it('refuses the rule mutations to a member without the data model permission', async () => {
    const { errors } = await createSharingRule({
      expectToFail: true,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      input: {
        objectMetadataId,
        name: 'Member rule',
        granteePrincipalType: RecordSharePrincipalType.EVERYONE,
        accessLevel: RecordShareAccessLevel.READ,
      },
    });

    expect(errors).toEqual([
      expect.objectContaining({
        extensions: expect.objectContaining({
          code: 'FORBIDDEN',
          subCode: 'PERMISSION_DENIED',
        }),
      }),
    ]);
  });

  it('deletes the rule together with its criteria', async () => {
    jestExpectToBeDefined(sharingRuleId);

    const { data, errors } = await deleteSharingRule({
      expectToFail: false,
      input: { id: sharingRuleId },
    });

    expect(errors).toBeUndefined();
    expect(data.deleteSharingRule.id).toBe(sharingRuleId);

    const { data: listData } = await findSharingRules({
      expectToFail: false,
      input: { objectMetadataId },
    });

    expect(listData.sharingRules).toHaveLength(0);
    expect(await countPredicateRows(sharingRuleId)).toBe(0);

    const { errors: upsertErrors } = await upsertRowLevelPermissionPredicates({
      expectToFail: true,
      gqlFields: RULE_PREDICATE_GQL_FIELDS,
      input: {
        sharingRuleId,
        objectMetadataId,
        predicates: [],
        predicateGroups: [],
      },
    });

    expect(upsertErrors).toEqual([
      expect.objectContaining({
        extensions: expect.objectContaining({
          code: 'NOT_FOUND',
          subCode: 'SHARING_RULE_NOT_FOUND',
        }),
      }),
    ]);

    sharingRuleId = undefined;
  });
});
