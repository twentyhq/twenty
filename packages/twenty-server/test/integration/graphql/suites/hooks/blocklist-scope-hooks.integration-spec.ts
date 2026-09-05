import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { restoreManyOperationFactory } from 'test/integration/graphql/utils/restore-many-operation-factory.util';
import { restoreOneOperationFactory } from 'test/integration/graphql/utils/restore-one-operation-factory.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { BlocklistScope } from 'twenty-shared/types';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const BLOCKLIST_GQL_FIELDS = `
  id
  handle
  scope
  workspaceMemberId
  deletedAt
`;

const CREATE_BLOCKLISTS_WITH_UPSERT = gql`
  mutation CreateBlocklists($data: [BlocklistCreateInput!]!, $upsert: Boolean) {
    createBlocklists(data: $data, upsert: $upsert) {
      id
      handle
      scope
      workspaceMemberId
    }
  }
`;

const MERGE_BLOCKLISTS = gql`
  mutation MergeBlocklists($ids: [UUID!]!, $conflictPriorityIndex: Int!) {
    mergeBlocklists(ids: $ids, conflictPriorityIndex: $conflictPriorityIndex) {
      id
    }
  }
`;

const uniqueEmailHandle = (prefix: string) =>
  `${prefix}-${randomUUID()}@blocklist.test`;

const uniqueDomainHandle = () => `@${randomUUID()}.test`;

describe('blocklist scope hooks', () => {
  const blocklistIds: string[] = [];

  const trackedId = () => {
    const id = randomUUID();

    blocklistIds.push(id);

    return id;
  };

  const createAsAdmin = (input: Record<string, unknown>) =>
    createOneOperation({
      objectMetadataSingularName: 'blocklist',
      gqlFields: BLOCKLIST_GQL_FIELDS,
      input,
    });

  const createAsMember = (input: Record<string, unknown>) =>
    makeGraphqlAPIRequestWithMemberRole(
      createOneOperationFactory({
        objectMetadataSingularName: 'blocklist',
        gqlFields: BLOCKLIST_GQL_FIELDS,
        data: input,
      }),
    );

  const upsertAsMember = (data: Record<string, unknown>) =>
    makeGraphqlAPIRequestWithMemberRole({
      query: CREATE_BLOCKLISTS_WITH_UPSERT,
      variables: { data: [data], upsert: true },
    });

  const upsertAsAdmin = (data: Record<string, unknown>) =>
    makeGraphqlAPIRequest({
      query: CREATE_BLOCKLISTS_WITH_UPSERT,
      variables: { data: [data], upsert: true },
    });

  const deleteAsAdmin = (recordId: string) =>
    makeGraphqlAPIRequest(
      deleteOneOperationFactory({
        objectMetadataSingularName: 'blocklist',
        gqlFields: BLOCKLIST_GQL_FIELDS,
        recordId,
      }),
    );

  const restoreOne = (
    recordId: string,
    request: typeof makeGraphqlAPIRequest = makeGraphqlAPIRequest,
  ) =>
    request(
      restoreOneOperationFactory({
        objectMetadataSingularName: 'blocklist',
        gqlFields: BLOCKLIST_GQL_FIELDS,
        recordId,
      }),
    );

  afterAll(async () => {
    for (const blocklistId of blocklistIds) {
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'blocklist',
          gqlFields: 'id',
          recordId: blocklistId,
        }),
      );
    }
  });

  it('lets an admin create a workspace-scoped entry with no workspace member', async () => {
    const { data, errors } = await createAsAdmin({
      id: trackedId(),
      handle: uniqueDomainHandle(),
      scope: BlocklistScope.WORKSPACE,
    });

    expect(errors).toBeUndefined();
    expect(data.createOneResponse.scope).toBe(BlocklistScope.WORKSPACE);
    expect(data.createOneResponse.workspaceMemberId).toBeNull();
  });

  it('lets a member create their own member-scoped entry', async () => {
    const response = await createAsMember({
      id: trackedId(),
      handle: uniqueEmailHandle('my-own-entry'),
      scope: BlocklistScope.WORKSPACE_MEMBER,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createBlocklist.scope).toBe(
      BlocklistScope.WORKSPACE_MEMBER,
    );
  });

  it('refuses a workspace-scoped entry that also targets a workspace member', async () => {
    const { errors } = await createAsAdmin({
      id: randomUUID(),
      handle: uniqueDomainHandle(),
      scope: BlocklistScope.WORKSPACE,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });

    expect(errors).toBeDefined();
  });

  it('refuses a workspace-scoped entry created without the workspace permission', async () => {
    const response = await createAsMember({
      id: randomUUID(),
      handle: uniqueDomainHandle(),
      scope: BlocklistScope.WORKSPACE,
    });

    expect(response.body.errors).toBeDefined();
  });

  it('refuses a member-scoped entry targeting another workspace member', async () => {
    const response = await createAsMember({
      id: randomUUID(),
      handle: uniqueEmailHandle('someone-elses-entry'),
      scope: BlocklistScope.WORKSPACE_MEMBER,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });

    expect(response.body.errors).toBeDefined();
  });

  it('refuses a member-scoped entry with no workspace member', async () => {
    const response = await createAsMember({
      id: randomUUID(),
      handle: uniqueEmailHandle('ownerless'),
      scope: BlocklistScope.WORKSPACE_MEMBER,
    });

    expect(response.body.errors).toBeDefined();
  });

  it('refuses to overwrite a workspace-scoped entry through an upsert create', async () => {
    const id = trackedId();

    await createAsAdmin({
      id,
      handle: uniqueDomainHandle(),
      scope: BlocklistScope.WORKSPACE,
    });

    const hijackResponse = await upsertAsMember({
      id,
      handle: uniqueEmailHandle('hijacked'),
      scope: BlocklistScope.WORKSPACE_MEMBER,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });

    expect(hijackResponse.body.errors).toBeDefined();

    const renamedHandle = uniqueDomainHandle();

    const adminResponse = await upsertAsAdmin({
      id,
      handle: renamedHandle,
      scope: BlocklistScope.WORKSPACE,
    });

    expect(adminResponse.body.errors).toBeUndefined();
    expect(adminResponse.body.data.createBlocklists[0].handle).toBe(
      renamedHandle,
    );

    const idempotentResponse = await upsertAsAdmin({
      id,
      handle: renamedHandle,
      scope: BlocklistScope.WORKSPACE,
    });

    expect(idempotentResponse.body.errors).toBeUndefined();
    expect(idempotentResponse.body.data.createBlocklists[0].handle).toBe(
      renamedHandle,
    );
  });

  it('refuses a scope change on an existing entry', async () => {
    const id = trackedId();

    await createAsAdmin({
      id,
      handle: uniqueEmailHandle('immutable-scope'),
      scope: BlocklistScope.WORKSPACE_MEMBER,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });

    const response = await makeGraphqlAPIRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'blocklist',
        gqlFields: BLOCKLIST_GQL_FIELDS,
        recordId: id,
        data: { scope: BlocklistScope.WORKSPACE },
      }),
    );

    expect(response.body.errors).toBeDefined();
  });

  it('refuses to null out the workspace member of a member-scoped entry', async () => {
    const id = trackedId();

    await createAsAdmin({
      id,
      handle: uniqueEmailHandle('immutable-owner'),
      scope: BlocklistScope.WORKSPACE_MEMBER,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });

    const response = await makeGraphqlAPIRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'blocklist',
        gqlFields: BLOCKLIST_GQL_FIELDS,
        recordId: id,
        data: { workspaceMemberId: null },
      }),
    );

    expect(response.body.errors).toBeDefined();
  });

  it('refuses deletion and restoration of a workspace-scoped entry without the workspace permission', async () => {
    const id = trackedId();

    await createAsAdmin({
      id,
      handle: uniqueDomainHandle(),
      scope: BlocklistScope.WORKSPACE,
    });

    const deleteAsMemberResponse = await makeGraphqlAPIRequestWithMemberRole(
      deleteOneOperationFactory({
        objectMetadataSingularName: 'blocklist',
        gqlFields: BLOCKLIST_GQL_FIELDS,
        recordId: id,
      }),
    );

    expect(deleteAsMemberResponse.body.errors).toBeDefined();

    const deleteAsAdminResponse = await deleteAsAdmin(id);

    expect(deleteAsAdminResponse.body.errors).toBeUndefined();
    expect(
      deleteAsAdminResponse.body.data.deleteBlocklist.deletedAt,
    ).not.toBeNull();

    const restoreAsMemberResponse = await restoreOne(
      id,
      makeGraphqlAPIRequestWithMemberRole,
    );

    expect(restoreAsMemberResponse.body.errors).toBeDefined();
  });

  it('refuses to restore an entry whose handle was taken again while it was deleted', async () => {
    const id = trackedId();
    const handle = uniqueDomainHandle();

    await createAsAdmin({ id, handle, scope: BlocklistScope.WORKSPACE });

    const deleteResponse = await deleteAsAdmin(id);

    expect(deleteResponse.body.errors).toBeUndefined();

    const { errors: recreateErrors } = await createAsAdmin({
      id: trackedId(),
      handle,
      scope: BlocklistScope.WORKSPACE,
    });

    expect(recreateErrors).toBeUndefined();

    const restoreResponse = await restoreOne(id);

    expect(restoreResponse.body.errors).toBeDefined();
    expect(restoreResponse.body.errors[0].message).toMatch(/already exists/i);
  });

  it('refuses every bulk mutation of blocklist entries', async () => {
    const filter = { scope: { eq: BlocklistScope.WORKSPACE } };

    const mergeSourceIds = [trackedId(), trackedId()];

    for (const mergeSourceId of mergeSourceIds) {
      const { errors: mergeSourceErrors } = await createAsAdmin({
        id: mergeSourceId,
        handle: uniqueDomainHandle(),
        scope: BlocklistScope.WORKSPACE,
      });

      expect(mergeSourceErrors).toBeUndefined();
    }

    const bulkResponses = [
      await makeGraphqlAPIRequest(
        deleteManyOperationFactory({
          objectMetadataSingularName: 'blocklist',
          objectMetadataPluralName: 'blocklists',
          gqlFields: BLOCKLIST_GQL_FIELDS,
          filter,
        }),
      ),
      await makeGraphqlAPIRequest(
        destroyManyOperationFactory({
          objectMetadataSingularName: 'blocklist',
          objectMetadataPluralName: 'blocklists',
          gqlFields: BLOCKLIST_GQL_FIELDS,
          filter,
        }),
      ),
      await makeGraphqlAPIRequest(
        restoreManyOperationFactory({
          objectMetadataSingularName: 'blocklist',
          objectMetadataPluralName: 'blocklists',
          gqlFields: BLOCKLIST_GQL_FIELDS,
          filter,
        }),
      ),
      await makeGraphqlAPIRequest(
        updateManyOperationFactory({
          objectMetadataSingularName: 'blocklist',
          objectMetadataPluralName: 'blocklists',
          gqlFields: BLOCKLIST_GQL_FIELDS,
          filter,
          data: { handle: uniqueDomainHandle() },
        }),
      ),
      await makeGraphqlAPIRequest({
        query: MERGE_BLOCKLISTS,
        variables: { ids: mergeSourceIds, conflictPriorityIndex: 0 },
      }),
    ];

    for (const bulkResponse of bulkResponses) {
      expect(bulkResponse.body.errors).toBeDefined();
    }
  });

  it('refuses a second workspace-scoped entry with the same handle', async () => {
    const handle = uniqueDomainHandle();

    await createAsAdmin({
      id: trackedId(),
      handle,
      scope: BlocklistScope.WORKSPACE,
    });

    const { errors } = await createAsAdmin({
      id: randomUUID(),
      handle,
      scope: BlocklistScope.WORKSPACE,
    });

    expect(errors).toBeDefined();
  });
});
