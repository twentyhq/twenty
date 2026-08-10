import gql from 'graphql-tag';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

// Every unit test in this module mocks the repository, which means none of them
// can catch a missing workspace predicate or a missing access check: the mock
// answers whatever it is asked. These go through the real resolvers so the
// authorization surface is exercised rather than described.
const CREATE_INBOX_QUEUE = gql`
  mutation CreateInboxQueue($input: CreateInboxQueueInput!) {
    createInboxQueue(input: $input) {
      id
      name
      slug
      isDefault
      roleIds
    }
  }
`;

const SET_INBOX_QUEUE_ROLES = gql`
  mutation SetInboxQueueRoles($input: SetInboxQueueRolesInput!) {
    setInboxQueueRoles(input: $input) {
      id
      roleIds
    }
  }
`;

const SET_INBOX_ITEM_TYPE_DEFAULT_QUEUE = gql`
  mutation SetInboxItemTypeDefaultQueue(
    $input: SetInboxItemTypeDefaultQueueInput!
  ) {
    setInboxItemTypeDefaultQueue(input: $input) {
      id
      defaultQueueId
    }
  }
`;

const DELETE_INBOX_QUEUE = gql`
  mutation DeleteInboxQueue($queueId: UUID!) {
    deleteInboxQueue(queueId: $queueId)
  }
`;

const GET_INBOX_QUEUE_SETTINGS = gql`
  query GetInboxQueueSettings {
    inboxQueueSettings {
      id
      name
      slug
      isDefault
    }
  }
`;

const GET_INBOX_ITEM_TYPE_SETTINGS = gql`
  query GetInboxItemTypeSettings {
    inboxItemTypeSettings {
      id
      key
      defaultQueueId
    }
  }
`;

const GET_MY_INBOX_QUEUES = gql`
  query GetMyInboxQueues {
    myInboxQueues {
      id
      slug
    }
  }
`;

const GET_MY_INBOX_ITEMS = gql`
  query GetMyInboxItems($queueSlug: String) {
    myInboxItems(queueSlug: $queueSlug) {
      id
    }
  }
`;

const GET_ROLES = gql`
  query GetRoles {
    getRoles {
      id
      workspaceMembers {
        id
      }
    }
  }
`;

// Well-formed v4 uuids on purpose: a malformed one is rejected by the scalar
// before it reaches a resolver, which would pass the rejection tests below
// without ever exercising the lookup they are about
const UNKNOWN_QUEUE_ID = '11111111-2222-4333-8444-555555555555';
const UNKNOWN_ROLE_ID = '99999999-8888-4777-a666-555555555555';

describe('inbox queue administration', () => {
  const createdQueueIds: string[] = [];
  let memberRoleId: string;

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_INBOX_ENABLED,
      value: true,
      expectToFail: false,
    });

    const rolesResponse = await makeMetadataAPIRequest({ query: GET_ROLES });

    memberRoleId = rolesResponse.body.data.getRoles.find(
      ({ workspaceMembers }: { workspaceMembers: { id: string }[] }) =>
        workspaceMembers.some(
          ({ id }) => id === WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        ),
    ).id;
  });

  afterAll(async () => {
    for (const queueId of createdQueueIds) {
      await makeGraphqlAPIRequest({
        query: DELETE_INBOX_QUEUE,
        variables: { queueId },
      });
    }

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_INBOX_ENABLED,
      value: false,
      expectToFail: false,
    });
  });

  const createQueue = async (name: string) => {
    const response = await makeGraphqlAPIRequest({
      query: CREATE_INBOX_QUEUE,
      variables: { input: { name, roleIds: [] } },
    });

    const queue = response.body.data?.createInboxQueue;

    if (queue?.id) {
      createdQueueIds.push(queue.id);
    }

    return { response, queue };
  };

  it('should derive an address from the name when a shared inbox is created', async () => {
    // Act
    const { response, queue } = await createQueue('Integration Support');

    // Assert
    expect(response.body.errors).toBeUndefined();
    expect(queue).toMatchObject({
      name: 'Integration Support',
      slug: 'integration-support',
      isDefault: false,
    });
  });

  // Two teams can both call their inbox "Support"; they cannot both own the address
  it('should not reuse an address another shared inbox already holds', async () => {
    // Act
    const { queue } = await createQueue('Integration Support');

    // Assert
    expect(queue.slug).not.toBe('integration-support');
    expect(queue.slug).toMatch(/^integration-support-\d+$/);
  });

  // A role from another workspace satisfies the foreign key, so the workspace
  // predicate is the only thing keeping the grant out
  it('should reject a role that does not belong to this workspace', async () => {
    // Prepare
    const { queue } = await createQueue('Integration Foreign Role');

    // Act
    const response = await makeGraphqlAPIRequest({
      query: SET_INBOX_QUEUE_ROLES,
      variables: { input: { queueId: queue.id, roleIds: [UNKNOWN_ROLE_ID] } },
    });

    // Assert
    expect(response.body.errors).toBeDefined();
    expect(response.body.data?.setInboxQueueRoles).toBeFalsy();
  });

  it('should reject granting access to a shared inbox that does not exist', async () => {
    // Act
    const response = await makeGraphqlAPIRequest({
      query: SET_INBOX_QUEUE_ROLES,
      variables: { input: { queueId: UNKNOWN_QUEUE_ID, roleIds: [] } },
    });

    // Assert
    expect(response.body.errors).toBeDefined();
    expect(response.body.data?.setInboxQueueRoles).toBeFalsy();
  });

  // The routing default is an address items are sent to, so an id this
  // workspace cannot see into must never become one
  it('should reject routing a kind of work to a shared inbox that does not exist', async () => {
    // Prepare
    const typesResponse = await makeGraphqlAPIRequest({
      query: GET_INBOX_ITEM_TYPE_SETTINGS,
    });
    const inboxItemType = typesResponse.body.data.inboxItemTypeSettings[0];

    // Act
    const response = await makeGraphqlAPIRequest({
      query: SET_INBOX_ITEM_TYPE_DEFAULT_QUEUE,
      variables: {
        input: {
          inboxItemTypeId: inboxItemType.id,
          defaultQueueId: UNKNOWN_QUEUE_ID,
        },
      },
    });

    // Assert
    expect(response.body.errors).toBeDefined();

    const unchanged = await makeGraphqlAPIRequest({
      query: GET_INBOX_ITEM_TYPE_SETTINGS,
    });

    expect(
      unchanged.body.data.inboxItemTypeSettings.find(
        ({ id }: { id: string }) => id === inboxItemType.id,
      ).defaultQueueId,
    ).toBe(inboxItemType.defaultQueueId);
  });

  it('should refuse to delete the triage inbox', async () => {
    // Prepare: triage is created on demand, and deleting a queue is one of the
    // things that needs somewhere to move the work to
    const { queue } = await createQueue('Integration Triage Trigger');

    await makeGraphqlAPIRequest({
      query: DELETE_INBOX_QUEUE,
      variables: { queueId: queue.id },
    });

    const settings = await makeGraphqlAPIRequest({
      query: GET_INBOX_QUEUE_SETTINGS,
    });
    const triage = settings.body.data.inboxQueueSettings.find(
      ({ isDefault }: { isDefault: boolean }) => isDefault,
    );

    expect(triage).toBeDefined();

    // Act
    const response = await makeGraphqlAPIRequest({
      query: DELETE_INBOX_QUEUE,
      variables: { queueId: triage.id },
    });

    // Assert
    expect(response.body.errors).toBeDefined();
  });

  describe('access', () => {
    // The gate that keeps one team out of another team's work
    it('should hide a shared inbox from a role it was not granted to', async () => {
      // Prepare
      const { queue } = await createQueue('Integration Private');

      // Act
      const memberResponse = await makeGraphqlAPIRequest(
        { query: GET_MY_INBOX_ITEMS, variables: { queueSlug: queue.slug } },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      // Assert
      expect(memberResponse.body.errors).toBeDefined();
      expect(memberResponse.body.data?.myInboxItems).toBeFalsy();
    });

    // The same person, before and after their role is granted access: the grant
    // is the only thing that changes the answer
    it('should put a shared inbox in the drawer only once a role can reach it', async () => {
      // Prepare
      const { queue } = await createQueue('Integration Granted');

      const jonyQueueIds = async () =>
        (
          await makeGraphqlAPIRequest(
            { query: GET_MY_INBOX_QUEUES },
            APPLE_JONY_MEMBER_ACCESS_TOKEN,
          )
        ).body.data.myInboxQueues.map(({ id }: { id: string }) => id);

      expect(await jonyQueueIds()).not.toContain(queue.id);

      // Act
      await makeGraphqlAPIRequest({
        query: SET_INBOX_QUEUE_ROLES,
        variables: { input: { queueId: queue.id, roleIds: [memberRoleId] } },
      });

      // Assert
      expect(await jonyQueueIds()).toContain(queue.id);

      const readable = await makeGraphqlAPIRequest(
        { query: GET_MY_INBOX_ITEMS, variables: { queueSlug: queue.slug } },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(readable.body.errors).toBeUndefined();
      expect(readable.body.data.myInboxItems).toEqual([]);
    });

    // Saving the list replaces it, so a role dropped from it loses the inbox
    it('should take the shared inbox back out of the drawer when the grant is removed', async () => {
      // Prepare
      const { queue } = await createQueue('Integration Revoked');

      await makeGraphqlAPIRequest({
        query: SET_INBOX_QUEUE_ROLES,
        variables: { input: { queueId: queue.id, roleIds: [memberRoleId] } },
      });

      // Act
      await makeGraphqlAPIRequest({
        query: SET_INBOX_QUEUE_ROLES,
        variables: { input: { queueId: queue.id, roleIds: [] } },
      });

      // Assert
      const drawer = await makeGraphqlAPIRequest(
        { query: GET_MY_INBOX_QUEUES },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(
        drawer.body.data.myInboxQueues.map(({ id }: { id: string }) => id),
      ).not.toContain(queue.id);
    });

    // Administration is settings-gated: it decides who can reach which shared
    // inbox, so a plain member must not be able to grant themselves one
    it('should refuse queue administration to a member without workspace settings', async () => {
      // Act
      const response = await makeGraphqlAPIRequest(
        {
          query: CREATE_INBOX_QUEUE,
          variables: {
            input: { name: 'Integration Escalation', roleIds: [] },
          },
        },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      // Assert
      expect(response.body.errors).toBeDefined();
      expect(response.body.data?.createInboxQueue).toBeFalsy();
    });
  });

  describe('feature flag', () => {
    it('should not answer inbox settings queries when the inbox is disabled', async () => {
      // Prepare
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_INBOX_ENABLED,
        value: false,
        expectToFail: false,
      });

      // Act
      const response = await makeGraphqlAPIRequest(
        { query: GET_INBOX_QUEUE_SETTINGS },
        APPLE_JANE_ADMIN_ACCESS_TOKEN,
      );

      // Assert
      expect(response.body.errors).toBeDefined();

      // Cleanup for the suite's remaining teardown
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_INBOX_ENABLED,
        value: true,
        expectToFail: false,
      });
    });
  });
});
