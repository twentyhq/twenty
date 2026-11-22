import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { destroyOneOperation } from 'test/integration/graphql/utils/destroy-one-operation.util';
import { findOneOperation } from 'test/integration/graphql/utils/find-one-operation.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { updateOneOperation } from 'test/integration/graphql/utils/update-one-operation.util';
import { groupByOperationFactory } from 'test/integration/graphql/utils/group-by-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { upsertFieldPermissions } from 'test/integration/metadata/suites/field-permission/utils/upsert-field-permissions.util';
import { revokeObjectRecordsPermissions } from 'test/integration/metadata/suites/object-permission/utils/revoke-object-records-permissions.util';
import { upsertRowLevelPermissionRules } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-rules.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { findRoles } from 'test/integration/metadata/suites/role/utils/find-roles.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { removeRecordShareOperationFactory } from 'test/integration/permissions/utils/remove-record-share-operation-factory.util';
import { setRecordShareOperationFactory } from 'test/integration/permissions/utils/set-record-share-operation-factory.util';
import { findFieldMetadataIdByName } from 'test/integration/utils/find-field-metadata-id-by-name.util';
import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import {
  FeatureFlagKey,
  RecordShareAccessLevel,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

describe('field permissions on an RLS rule (integration)', () => {
  let objectMetadataId: string;
  let avatarUrlFieldMetadataId: string;
  let originalPeople: { id: string; jobTitle: string; avatarUrl: string }[];
  let originalMemberRoleId: string;
  let roleId: string;
  let rlsRuleId: string;
  let rlsPredicateId: string;
  let jobTitleFieldMetadataId: string;

  const findFieldMetadataId = (fieldName: string): Promise<string> =>
    findFieldMetadataIdByName({ objectMetadataId, fieldName });

  const upsertParisRule = ({
    canUpdateRecords,
  }: {
    canUpdateRecords: boolean;
  }) =>
    upsertRowLevelPermissionRules({
      expectToFail: false,
      input: {
        roleId,
        objectMetadataId,
        rules: [
          {
            canReadRecords: true,
            canUpdateRecords,
            predicateGroups: [
              {
                id: rlsRuleId,
                logicalOperator:
                  RowLevelPermissionPredicateGroupLogicalOperator.AND,
                predicates: [
                  {
                    id: rlsPredicateId,
                    fieldMetadataId: jobTitleFieldMetadataId,
                    operand: RowLevelPermissionPredicateOperand.CONTAINS,
                    value: 'Paris',
                  },
                ],
              },
            ],
          },
        ],
      },
    });

  const updatePerson = ({
    recordId,
    input,
  }: {
    recordId: string;
    input: Record<string, unknown>;
  }) =>
    updateOneOperation({
      objectMetadataSingularName: 'person',
      recordId,
      input,
    });

  const findAvatarFieldPermissionRuleIds = async (): Promise<
    (string | null)[]
  > => {
    const { data } = await findRoles({
      gqlFields:
        'id fieldPermissions { fieldMetadataId rowLevelPermissionPredicateGroupId } rowLevelPermissionFieldPermissions { fieldMetadataId rowLevelPermissionPredicateGroupId }',
    });
    const role = data.getRoles.find(({ id }) => id === roleId);

    return [
      ...(role?.fieldPermissions ?? []),
      ...(role?.rowLevelPermissionFieldPermissions ?? []),
    ]
      .filter(
        (fieldPermission) =>
          fieldPermission.fieldMetadataId === avatarUrlFieldMetadataId,
      )
      .map(
        (fieldPermission) =>
          fieldPermission.rowLevelPermissionPredicateGroupId ?? null,
      );
  };

  const listPeopleAsMember = async (): Promise<
    { id: string; avatarUrl: string; jobTitle: string }[]
  > => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id avatarUrl jobTitle',
        filter: { id: { in: originalPeople.map(({ id }) => id) } },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.people.edges.map(
      (edge: { node: { id: string; avatarUrl: string; jobTitle: string } }) =>
        edge.node,
    );
  };

  const findPersonIdsMatchingAsMember = async (
    filter: object,
  ): Promise<string[]> => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: { id: { in: originalPeople.map(({ id }) => id) }, ...filter },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.people.edges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );
  };

  beforeAll(async () => {
    objectMetadataId = await findObjectMetadataIdByName('person');
    [avatarUrlFieldMetadataId, jobTitleFieldMetadataId] = await Promise.all([
      findFieldMetadataId('avatarUrl'),
      findFieldMetadataId('jobTitle'),
    ]);

    const peopleResponse = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id jobTitle avatarUrl',
        orderBy: [{ id: 'AscNullsLast' }],
        first: 2,
      }),
    );

    originalPeople = peopleResponse.body.data.people.edges.map(
      (edge: { node: { id: string; jobTitle: string; avatarUrl: string } }) =>
        edge.node,
    );
    await Promise.all(
      originalPeople.map(({ id }, index) =>
        updatePerson({
          recordId: id,
          input: {
            avatarUrl: 'Secret avatar',
            jobTitle: index === 0 ? 'Paris office' : 'London office',
          },
        }),
      ),
    );

    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'RLS rule field permissions',
        description: 'RLS rule field permissions',
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });

    roleId = data.createOneRole.id;
    rlsRuleId = v4();
    rlsPredicateId = v4();

    await revokeObjectRecordsPermissions({ roleId, objectMetadataId });
    await upsertParisRule({ canUpdateRecords: false });

    await upsertFieldPermissions({
      expectToFail: false,
      input: {
        roleId,
        fieldPermissions: [
          {
            objectMetadataId,
            fieldMetadataId: avatarUrlFieldMetadataId,
            rowLevelPermissionPredicateGroupId: rlsRuleId,
            canReadFieldValue: false,
          },
        ],
      },
    });

    originalMemberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    await updateWorkspaceMemberRole({
      expectToFail: false,
      input: {
        roleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
    });
  });

  afterAll(async () => {
    await updateWorkspaceMemberRole({
      expectToFail: false,
      input: {
        roleId: originalMemberRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
    });
    await deleteOneRole({ expectToFail: false, input: { idToDelete: roleId } });

    await Promise.all(
      originalPeople.map(({ id, jobTitle, avatarUrl }) =>
        updatePerson({ recordId: id, input: { jobTitle, avatarUrl } }),
      ),
    );
  });

  it('should read the unreadable field as empty on a record the RLS rule matches', async () => {
    expect(await listPeopleAsMember()).toEqual([
      { id: originalPeople[0].id, avatarUrl: '', jobTitle: 'Paris office' },
    ]);
  });

  it.each([
    ['the unreadable value', { eq: 'Secret avatar' }],
    ['an empty value', { is: 'NULL' }],
  ])(
    'should not match %s in a filter on the unreadable field',
    async (_, avatarUrlFilter) => {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          gqlFields: 'id',
          filter: {
            id: { in: originalPeople.map(({ id }) => id) },
            avatarUrl: avatarUrlFilter,
          },
        }),
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.people.edges).toEqual([]);
    },
  );

  it('should match a record through a readable condition of an OR that also reads the unreadable field', async () => {
    expect(
      await findPersonIdsMatchingAsMember({
        or: [
          { jobTitle: { eq: 'Paris office' } },
          { avatarUrl: { eq: 'Secret avatar' } },
        ],
      }),
    ).toEqual([originalPeople[0].id]);
  });

  it('should not match a record through the unreadable condition of an OR', async () => {
    expect(
      await findPersonIdsMatchingAsMember({
        or: [
          { jobTitle: { eq: 'Nowhere office' } },
          { avatarUrl: { eq: 'Secret avatar' } },
        ],
      }),
    ).toEqual([]);
  });

  it('should not match a record through a negated filter on the unreadable field', async () => {
    expect(
      await findPersonIdsMatchingAsMember({
        not: { avatarUrl: { eq: 'Other avatar' } },
      }),
    ).toEqual([]);
  });

  it('should page past the records a sorted field is unreadable on', async () => {
    const listPersonPageAsMember = async (after?: string) => {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          gqlFields: 'id',
          filter: { id: { in: originalPeople.map(({ id }) => id) } },
          orderBy: [{ avatarUrl: 'AscNullsLast' }],
          first: 1,
          after,
        }),
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(response.body.errors).toBeUndefined();

      return response.body.data.people;
    };

    await updatePerson({
      recordId: originalPeople[1].id,
      input: { jobTitle: 'Paris office' },
    });

    try {
      const firstPage = await listPersonPageAsMember();
      const secondPage = await listPersonPageAsMember(
        firstPage.pageInfo.endCursor,
      );

      expect(
        [...firstPage.edges, ...secondPage.edges]
          .map((edge: { node: { id: string } }) => edge.node.id)
          .sort(),
      ).toEqual(originalPeople.map(({ id }) => id).sort());
    } finally {
      await updatePerson({
        recordId: originalPeople[1].id,
        input: { jobTitle: 'London office' },
      });
    }
  });

  it('should leave the rows a field is unreadable on out of a group on it', async () => {
    const introFieldMetadataId = await findFieldMetadataId('intro');
    const setIntroReadability = (canReadFieldValue: false | null) =>
      upsertFieldPermissions({
        expectToFail: false,
        input: {
          roleId,
          fieldPermissions: [
            {
              objectMetadataId,
              fieldMetadataId: introFieldMetadataId,
              rowLevelPermissionPredicateGroupId: rlsRuleId,
              canReadFieldValue,
            },
          ],
        },
      });
    const {
      data: {
        findResponse: { intro: originalIntro },
      },
    } = await findOneOperation({
      objectMetadataSingularName: 'person',
      gqlFields: 'id intro',
      filter: { id: { eq: originalPeople[0].id } },
    });

    await updatePerson({
      recordId: originalPeople[0].id,
      input: { intro: 'Secret intro' },
    });
    await setIntroReadability(false);

    try {
      const response = await makeGraphqlApiRequest(
        groupByOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          groupBy: [{ intro: true }],
          filter: { id: { in: originalPeople.map(({ id }) => id) } },
        }),
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.peopleGroupBy).toEqual([]);
    } finally {
      await setIntroReadability(null);
      await updatePerson({
        recordId: originalPeople[0].id,
        input: { intro: originalIntro },
      });
    }
  });

  it('should make the label identifier unreadable on the records the RLS rule matches', async () => {
    const nameFieldMetadataId = await findFieldMetadataId('name');
    const setNameReadability = (canReadFieldValue: false | null) =>
      upsertFieldPermissions({
        expectToFail: false,
        input: {
          roleId,
          fieldPermissions: [
            {
              objectMetadataId,
              fieldMetadataId: nameFieldMetadataId,
              rowLevelPermissionPredicateGroupId: rlsRuleId,
              canReadFieldValue,
            },
          ],
        },
      });

    await setNameReadability(false);

    try {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          gqlFields: 'id name { firstName lastName }',
          filter: { id: { in: originalPeople.map(({ id }) => id) } },
        }),
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(response.body.errors).toBeUndefined();
      expect(
        response.body.data.people.edges.map(
          (edge: { node: { id: string } }) => edge.node,
        ),
      ).toEqual([
        { id: originalPeople[0].id, name: { firstName: '', lastName: '' } },
      ]);
    } finally {
      await setNameReadability(null);
    }
  });

  it('should make a relation unreadable on the records the RLS rule matches', async () => {
    const parisPersonId = originalPeople[0].id;
    const {
      data: {
        findResponse: { companyId: originalCompanyId },
      },
    } = await findOneOperation({
      objectMetadataSingularName: 'person',
      gqlFields: 'id companyId',
      filter: { id: { eq: parisPersonId } },
    });
    const [
      {
        data: {
          createOneResponse: { id: companyId },
        },
      },
      {
        data: {
          createOneResponse: { id: taskId },
        },
      },
    ] = await Promise.all([
      createOneOperation({
        objectMetadataSingularName: 'company',
        input: { name: 'RLS rule relation company' },
      }),
      createOneOperation({
        objectMetadataSingularName: 'task',
        input: { title: 'RLS rule relation task' },
      }),
    ]);
    const {
      data: {
        createOneResponse: { id: taskTargetId },
      },
    } = await createOneOperation({
      objectMetadataSingularName: 'taskTarget',
      input: { taskId, targetPersonId: parisPersonId },
    });
    const setRelationsReadability = async (canReadFieldValue: false | null) =>
      upsertFieldPermissions({
        expectToFail: false,
        input: {
          roleId,
          fieldPermissions: await Promise.all(
            ['company', 'taskTargets'].map(async (name) => ({
              objectMetadataId,
              fieldMetadataId: await findFieldMetadataId(name),
              rowLevelPermissionPredicateGroupId: rlsRuleId,
              canReadFieldValue,
            })),
          ),
        },
      });
    const listParisRelationsAsMember = async (filter: object = {}) => {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          gqlFields:
            'id companyId company { id } taskTargets { edges { node { id } } }',
          filter: { id: { eq: parisPersonId }, ...filter },
        }),
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(response.body.errors).toBeUndefined();

      return response.body.data.people.edges.map(
        ({
          node,
        }: {
          node: {
            companyId: string | null;
            company: { id: string } | null;
            taskTargets: { edges: { node: { id: string } }[] };
          };
        }) => ({
          companyId: node.companyId,
          companyRecordId: node.company?.id ?? null,
          taskTargetIds: node.taskTargets.edges.map(({ node }) => node.id),
        }),
      );
    };

    await updatePerson({ recordId: parisPersonId, input: { companyId } });

    try {
      expect(await listParisRelationsAsMember()).toEqual([
        {
          companyId,
          companyRecordId: companyId,
          taskTargetIds: expect.arrayContaining([taskTargetId]),
        },
      ]);

      await setRelationsReadability(false);

      expect(await listParisRelationsAsMember()).toEqual([
        { companyId: null, companyRecordId: null, taskTargetIds: [] },
      ]);
      expect(
        await listParisRelationsAsMember({
          company: { id: { eq: companyId } },
        }),
      ).toEqual([]);
      expect(
        await listParisRelationsAsMember({ companyId: { is: 'NULL' } }),
      ).toEqual([]);
    } finally {
      await setRelationsReadability(null);
      await updatePerson({
        recordId: parisPersonId,
        input: { companyId: originalCompanyId },
      });
      await destroyOneOperation({
        objectMetadataSingularName: 'taskTarget',
        recordId: taskTargetId,
      });
      await Promise.all([
        destroyOneOperation({
          objectMetadataSingularName: 'task',
          recordId: taskId,
        }),
        destroyOneOperation({
          objectMetadataSingularName: 'company',
          recordId: companyId,
        }),
      ]);
    }
  });

  it('should keep the field on a record reached through a share', async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
      value: true,
      expectToFail: false,
    });
    const share = {
      objectMetadataId,
      recordId: originalPeople[1].id,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    };
    const setShareResponse = await makeMetadataApiRequest(
      setRecordShareOperationFactory({
        ...share,
        accessLevel: RecordShareAccessLevel.READ,
      }),
    );

    expect(setShareResponse.body.errors).toBeUndefined();

    try {
      const people = await listPeopleAsMember();

      expect(people).toHaveLength(2);
      expect(
        people.find(({ id }) => id === originalPeople[0].id)?.avatarUrl,
      ).toBe('');
      expect(
        people.find(({ id }) => id === originalPeople[1].id)?.avatarUrl,
      ).toBe('Secret avatar');
    } finally {
      await makeMetadataApiRequest(removeRecordShareOperationFactory(share));
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
        value: false,
        expectToFail: false,
      });
    }
  });

  it('should keep rule rows out of the role object level field permissions', async () => {
    expect(await findAvatarFieldPermissionRuleIds()).toEqual([rlsRuleId]);

    const { errors } = await upsertFieldPermissions({
      expectToFail: false,
      input: {
        roleId,
        fieldPermissions: [
          {
            objectMetadataId,
            fieldMetadataId: avatarUrlFieldMetadataId,
            canUpdateFieldValue: false,
          },
        ],
      },
    });

    expect(errors).toBeUndefined();

    expect((await findAvatarFieldPermissionRuleIds()).sort()).toEqual(
      [rlsRuleId, null].sort(),
    );

    const { errors: updateErrors } = await upsertFieldPermissions({
      expectToFail: false,
      input: {
        roleId,
        fieldPermissions: [
          {
            objectMetadataId,
            fieldMetadataId: avatarUrlFieldMetadataId,
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ],
      },
    });

    expect(updateErrors).toBeUndefined();

    await upsertFieldPermissions({
      expectToFail: false,
      input: {
        roleId,
        fieldPermissions: [
          {
            objectMetadataId,
            fieldMetadataId: avatarUrlFieldMetadataId,
            canReadFieldValue: null,
            canUpdateFieldValue: null,
          },
        ],
      },
    });
  });

  it('should keep field permissions working after a rule is removed', async () => {
    const removedRuleId = v4();
    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Removed rule field permissions',
        description: 'Removed rule field permissions',
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });
    const removedRuleRoleId = data.createOneRole.id;

    try {
      await upsertRowLevelPermissionRules({
        expectToFail: false,
        input: {
          roleId: removedRuleRoleId,
          objectMetadataId,
          rules: [
            {
              predicateGroups: [
                {
                  id: removedRuleId,
                  logicalOperator:
                    RowLevelPermissionPredicateGroupLogicalOperator.AND,
                  predicates: [
                    {
                      id: v4(),
                      fieldMetadataId: await findFieldMetadataId('jobTitle'),
                      operand: RowLevelPermissionPredicateOperand.CONTAINS,
                      value: 'Paris',
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
      await upsertFieldPermissions({
        expectToFail: false,
        input: {
          roleId: removedRuleRoleId,
          fieldPermissions: [
            {
              objectMetadataId,
              fieldMetadataId: avatarUrlFieldMetadataId,
              rowLevelPermissionPredicateGroupId: removedRuleId,
              canReadFieldValue: false,
            },
          ],
        },
      });
      await upsertRowLevelPermissionRules({
        expectToFail: false,
        input: {
          roleId: removedRuleRoleId,
          objectMetadataId,
          rules: [],
        },
      });

      const { errors } = await upsertFieldPermissions({
        expectToFail: false,
        input: {
          roleId: removedRuleRoleId,
          fieldPermissions: [
            {
              objectMetadataId,
              fieldMetadataId: avatarUrlFieldMetadataId,
              canUpdateFieldValue: false,
            },
          ],
        },
      });

      expect(errors).toBeUndefined();
      expect(await listPeopleAsMember()).toHaveLength(1);
    } finally {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: removedRuleRoleId },
      });
    }
  });

  it('should add up object level and RLS rule unreadable fields', async () => {
    const jobTitleResponse = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id avatarUrl',
        filter: { id: { in: [originalPeople[0].id] } },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(jobTitleResponse.body.data.people.edges[0].node.avatarUrl).toBe('');

    const linkedinFieldMetadataId = await findFieldMetadataId('linkedinLink');

    await upsertFieldPermissions({
      expectToFail: false,
      input: {
        roleId,
        fieldPermissions: [
          {
            objectMetadataId,
            fieldMetadataId: linkedinFieldMetadataId,
            canReadFieldValue: false,
          },
        ],
      },
    });

    try {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          gqlFields: 'id linkedinLink { primaryLinkUrl }',
          filter: { id: { in: [originalPeople[0].id] } },
        }),
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(response.body.errors).toBeDefined();
    } finally {
      await upsertFieldPermissions({
        expectToFail: false,
        input: {
          roleId,
          fieldPermissions: [
            {
              objectMetadataId,
              fieldMetadataId: linkedinFieldMetadataId,
              canReadFieldValue: null,
            },
          ],
        },
      });
    }
  });

  it('should reject an update of an RLS rule uneditable field on a record it matches', async () => {
    await upsertParisRule({ canUpdateRecords: true });

    try {
      const response = await makeGraphqlApiRequest(
        updateOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: 'id',
          recordId: originalPeople[0].id,
          data: { avatarUrl: 'changed' },
        }),
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(response.body.errors).toBeDefined();

      const {
        data: { findResponse },
      } = await findOneOperation({
        objectMetadataSingularName: 'person',
        gqlFields: 'id avatarUrl',
        filter: { id: { eq: originalPeople[0].id } },
      });

      expect(findResponse.avatarUrl).toBe('Secret avatar');
    } finally {
      await upsertParisRule({ canUpdateRecords: false });
    }
  });

  it('should reject a required field', async () => {
    const { errors } = await upsertFieldPermissions({
      expectToFail: true,
      input: {
        roleId,
        fieldPermissions: [
          {
            objectMetadataId,
            fieldMetadataId: await findFieldMetadataId('createdBy'),
            rowLevelPermissionPredicateGroupId: rlsRuleId,
            canReadFieldValue: false,
          },
        ],
      },
    });

    expect(errors).toBeDefined();
  });

  it('should reject a rule that belongs to another role', async () => {
    const { errors } = await upsertFieldPermissions({
      expectToFail: true,
      input: {
        roleId: originalMemberRoleId,
        fieldPermissions: [
          {
            objectMetadataId,
            fieldMetadataId: avatarUrlFieldMetadataId,
            rowLevelPermissionPredicateGroupId: rlsRuleId,
            canReadFieldValue: false,
          },
        ],
      },
    });

    expect(errors).toBeDefined();
  });
});
