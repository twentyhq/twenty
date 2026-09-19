import gql from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { makeMetadataAPIRequestWithMemberRole } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-member-role.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const CREATE_CHANNEL = gql`
  mutation CreateChatChannel($input: CreateAgentChatChannelInput!) {
    createChatChannel(input: $input) {
      id
      name
      visibility
    }
  }
`;

const DELETE_CHANNEL = gql`
  mutation DeleteChatChannel($id: UUID!) {
    deleteChatChannel(id: $id)
  }
`;

const CREATE_THREAD = gql`
  mutation CreateChatThread($channelId: UUID) {
    createChatThread(channelId: $channelId) {
      id
      channelId
    }
  }
`;

const DELETE_THREAD = gql`
  mutation DeleteChatThread($id: UUID!) {
    deleteChatThread(id: $id)
  }
`;

const GET_THREAD = gql`
  query ChatThread($id: UUID!) {
    chatThread(id: $id) {
      id
      title
    }
  }
`;

const RENAME_THREAD = gql`
  mutation RenameChatThread($id: UUID!, $title: String!) {
    renameChatThread(id: $id, title: $title) {
      id
      title
    }
  }
`;

const JOIN_CHANNEL = gql`
  mutation JoinChatChannel($id: UUID!) {
    joinChatChannel(id: $id) {
      id
      userWorkspaceId
    }
  }
`;

const MARK_THREAD_READ = gql`
  mutation MarkChatThreadRead($threadId: UUID!) {
    markChatThreadRead(threadId: $threadId) {
      id
      userWorkspaceId
    }
  }
`;

const GET_THREAD_READS = gql`
  query ChatThreadReads($threadId: UUID!) {
    chatThreadReads(threadId: $threadId) {
      id
      userWorkspaceId
      lastReadAt
    }
  }
`;

const GET_UNREAD_THREAD_IDS = gql`
  query UnreadChatThreadIds($threadIds: [UUID!]!) {
    unreadChatThreadIds(threadIds: $threadIds)
  }
`;

// unreadChatThreadIds answers on the last message in a thread, so a thread
// without one is unread for nobody and would pass these cases whatever the
// access scoping does. sendChatMessage runs the agent, so the message goes
// in directly.
const writeMessageFromJane = async (threadId: string) => {
  await globalThis.testDataSource.query(
    `INSERT INTO "core"."agentMessage" ("threadId", "role", "workspaceId", "authorUserWorkspaceId")
     VALUES ($1, 'user', $2, $3)`,
    [threadId, SEED_APPLE_WORKSPACE_ID, USER_WORKSPACE_DATA_SEED_IDS.JANE],
  );
};

describe('Agent chat access (integration)', () => {
  let privateThreadId: string;
  let publicChannelId: string;
  let publicChannelThreadId: string;

  beforeAll(async () => {
    const privateThreadResponse = await makeMetadataAPIRequest({
      query: CREATE_THREAD,
      variables: { channelId: null },
    });

    privateThreadId = privateThreadResponse.body.data.createChatThread.id;

    const channelResponse = await makeMetadataAPIRequest({
      query: CREATE_CHANNEL,
      variables: {
        input: {
          name: `Access test channel ${Date.now()}`,
          visibility: 'PUBLIC',
        },
      },
    });

    publicChannelId = channelResponse.body.data.createChatChannel.id;

    const channelThreadResponse = await makeMetadataAPIRequest({
      query: CREATE_THREAD,
      variables: { channelId: publicChannelId },
    });

    publicChannelThreadId = channelThreadResponse.body.data.createChatThread.id;

    await writeMessageFromJane(privateThreadId);
    await writeMessageFromJane(publicChannelThreadId);
  });

  afterAll(async () => {
    await makeMetadataAPIRequest({
      query: DELETE_THREAD,
      variables: { id: publicChannelThreadId },
    });
    await makeMetadataAPIRequest({
      query: DELETE_THREAD,
      variables: { id: privateThreadId },
    });
    await makeMetadataAPIRequest({
      query: DELETE_CHANNEL,
      variables: { id: publicChannelId },
    });
  });

  describe('a thread outside any channel', () => {
    it('cannot be read by another member', async () => {
      const response = await makeMetadataAPIRequestWithMemberRole({
        query: GET_THREAD,
        variables: { id: privateThreadId },
      });

      expect(response.body.errors).toBeDefined();
      expect(response.body.data?.chatThread).toBeFalsy();
    });

    it('cannot be renamed by another member', async () => {
      const response = await makeMetadataAPIRequestWithMemberRole({
        query: RENAME_THREAD,
        variables: { id: privateThreadId, title: 'Stolen' },
      });

      expect(response.body.errors).toBeDefined();
    });

    it('does not leak through its read receipts', async () => {
      const response = await makeMetadataAPIRequestWithMemberRole({
        query: GET_THREAD_READS,
        variables: { threadId: privateThreadId },
      });

      expect(response.body.errors).toBeDefined();
      expect(response.body.data?.chatThreadReads).toBeFalsy();
    });

    it('is left out of another member unread ids rather than answered for', async () => {
      const response = await makeMetadataAPIRequestWithMemberRole({
        query: GET_UNREAD_THREAD_IDS,
        variables: { threadIds: [privateThreadId] },
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.unreadChatThreadIds).toEqual([]);
    });

    it('counts as unread for the owner of nothing, having been written by her', async () => {
      const response = await makeMetadataAPIRequest({
        query: GET_UNREAD_THREAD_IDS,
        variables: { threadIds: [privateThreadId] },
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.unreadChatThreadIds).toEqual([]);
    });
  });

  describe('a thread in a public channel', () => {
    it('is readable by a member who has not joined', async () => {
      const response = await makeMetadataAPIRequestWithMemberRole({
        query: GET_THREAD,
        variables: { id: publicChannelThreadId },
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.chatThread.id).toBe(publicChannelThreadId);
    });

    it('refuses a write from a member who has not joined', async () => {
      const response = await makeMetadataAPIRequestWithMemberRole({
        query: RENAME_THREAD,
        variables: { id: publicChannelThreadId, title: 'Renamed by a reader' },
      });

      expect(response.body.errors).toBeDefined();
    });

    it('takes the write once that member joins the channel', async () => {
      const joinResponse = await makeMetadataAPIRequestWithMemberRole({
        query: JOIN_CHANNEL,
        variables: { id: publicChannelId },
      });

      expect(joinResponse.body.errors).toBeUndefined();

      const renameResponse = await makeMetadataAPIRequestWithMemberRole({
        query: RENAME_THREAD,
        variables: { id: publicChannelThreadId, title: 'Renamed by a member' },
      });

      expect(renameResponse.body.errors).toBeUndefined();
      expect(renameResponse.body.data.renameChatThread.title).toBe(
        'Renamed by a member',
      );
    });
  });

  describe('unread threads', () => {
    it('marks a channel thread whose last message the reader has not seen', async () => {
      const response = await makeMetadataAPIRequestWithMemberRole({
        query: GET_UNREAD_THREAD_IDS,
        variables: { threadIds: [publicChannelThreadId] },
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.unreadChatThreadIds).toEqual([
        publicChannelThreadId,
      ]);
    });
  });

  describe('read receipts', () => {
    it('records who read a thread and shows it to the other participants', async () => {
      const markResponse = await makeMetadataAPIRequestWithMemberRole({
        query: MARK_THREAD_READ,
        variables: { threadId: publicChannelThreadId },
      });

      expect(markResponse.body.errors).toBeUndefined();
      expect(markResponse.body.data.markChatThreadRead.userWorkspaceId).toBe(
        USER_WORKSPACE_DATA_SEED_IDS.JONY,
      );

      const readsResponse = await makeMetadataAPIRequest({
        query: GET_THREAD_READS,
        variables: { threadId: publicChannelThreadId },
      });

      expect(readsResponse.body.errors).toBeUndefined();
      expect(
        readsResponse.body.data.chatThreadReads.map(
          (read: { userWorkspaceId: string }) => read.userWorkspaceId,
        ),
      ).toContain(USER_WORKSPACE_DATA_SEED_IDS.JONY);
    });

    it('clears the unread mark for whoever read it', async () => {
      const response = await makeMetadataAPIRequestWithMemberRole({
        query: GET_UNREAD_THREAD_IDS,
        variables: { threadIds: [publicChannelThreadId] },
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.unreadChatThreadIds).toEqual([]);
    });
  });
});
