import gql from 'graphql-tag';
import { type MessageFolderImportPolicy } from 'twenty-shared/types';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

type MessageChannelUpdate = {
  messageFolderImportPolicy?: MessageFolderImportPolicy;
  isSyncEnabled?: boolean;
  isContactAutoCreationEnabled?: boolean;
};

type MetadataAPIResponse = {
  body: { data: Record<string, unknown>; errors?: { message: string }[] };
};

export const getDataOrThrow = (response: MetadataAPIResponse) => {
  if (response.body.errors?.length) {
    throw new Error(
      `Metadata API request failed: ${response.body.errors
        .map((error) => error.message)
        .join('; ')}`,
    );
  }

  return response.body.data;
};

export type MessageFolderDto = Pick<
  MessageFolderWorkspaceEntity,
  'id' | 'name' | 'isSynced'
>;

export type MessageChannelDto = Pick<
  MessageChannelWorkspaceEntity,
  | 'id'
  | 'handle'
  | 'connectedAccountId'
  | 'syncStatus'
  | 'syncStage'
  | 'syncStageStartedAt'
  | 'throttleFailureCount'
  | 'throttleRetryAfter'
>;

export type CalendarChannelDto = Pick<
  CalendarChannelWorkspaceEntity,
  | 'id'
  | 'handle'
  | 'connectedAccountId'
  | 'syncStatus'
  | 'syncStage'
  | 'syncStageStartedAt'
  | 'throttleFailureCount'
>;

type CalendarChannelUpdate = {
  isSyncEnabled?: boolean;
  isContactAutoCreationEnabled?: boolean;
};

export type ConnectedAccountDto = Pick<
  ConnectedAccountEntity,
  'id' | 'handle' | 'provider' | 'lastCredentialsRefreshedAt' | 'authFailedAt'
>;

const MESSAGE_CHANNEL_FIELDS = gql`
  fragment TestMessageChannelFields on MessageChannel {
    id
    handle
    connectedAccountId
    syncStatus
    syncStage
    syncStageStartedAt
    throttleFailureCount
    throttleRetryAfter
  }
`;

export const queryMessageChannels = async (): Promise<MessageChannelDto[]> => {
  const response = await makeMetadataAPIRequest({
    query: gql`
      query MessageChannelsForTest {
        myMessageChannels {
          ...TestMessageChannelFields
        }
      }
      ${MESSAGE_CHANNEL_FIELDS}
    `,
  });

  return getDataOrThrow(response).myMessageChannels as MessageChannelDto[];
};

export const queryMessageChannel = async (
  connectedAccountId: string,
  messageChannelId: string,
): Promise<MessageChannelDto> => {
  const response = await makeMetadataAPIRequest({
    query: gql`
      query MessageChannelForTest($connectedAccountId: UUID) {
        myMessageChannels(connectedAccountId: $connectedAccountId) {
          ...TestMessageChannelFields
        }
      }
      ${MESSAGE_CHANNEL_FIELDS}
    `,
    variables: { connectedAccountId },
  });

  const channel = (
    getDataOrThrow(response).myMessageChannels as MessageChannelDto[]
  ).find((candidate: MessageChannelDto) => candidate.id === messageChannelId);

  if (!channel) {
    throw new Error(`Message channel ${messageChannelId} not found`);
  }

  return channel;
};

export const queryMessageFolders = async (
  messageChannelId: string,
): Promise<MessageFolderDto[]> => {
  const response = await makeMetadataAPIRequest({
    query: gql`
      query MessageFoldersForTest($messageChannelId: UUID) {
        myMessageFolders(messageChannelId: $messageChannelId) {
          id
          name
          isSynced
        }
      }
    `,
    variables: { messageChannelId },
  });

  return getDataOrThrow(response).myMessageFolders as MessageFolderDto[];
};

export const queryCalendarChannels = async (
  connectedAccountId: string,
): Promise<CalendarChannelDto[]> => {
  const response = await makeMetadataAPIRequest({
    query: gql`
      query CalendarChannelsForTest($connectedAccountId: UUID) {
        myCalendarChannels(connectedAccountId: $connectedAccountId) {
          id
          handle
          connectedAccountId
          syncStatus
          syncStage
          syncStageStartedAt
          throttleFailureCount
        }
      }
    `,
    variables: { connectedAccountId },
  });

  return getDataOrThrow(response).myCalendarChannels as CalendarChannelDto[];
};

export const queryConnectedAccount = async (
  connectedAccountId: string,
): Promise<ConnectedAccountDto> => {
  const response = await makeMetadataAPIRequest({
    query: gql`
      query ConnectedAccountsForTest {
        myConnectedAccounts {
          id
          handle
          provider
          lastCredentialsRefreshedAt
          authFailedAt
        }
      }
    `,
  });

  const account = (
    getDataOrThrow(response).myConnectedAccounts as ConnectedAccountDto[]
  ).find(
    (candidate: ConnectedAccountDto) => candidate.id === connectedAccountId,
  );

  if (!account) {
    throw new Error(`Connected account ${connectedAccountId} not found`);
  }

  return account;
};

export const updateMessageChannel = async (
  messageChannelId: string,
  update: MessageChannelUpdate,
): Promise<void> => {
  const response = await makeMetadataAPIRequest({
    query: gql`
      mutation UpdateMessageChannelForTest($input: UpdateMessageChannelInput!) {
        updateMessageChannel(input: $input) {
          id
        }
      }
    `,
    variables: {
      input: {
        id: messageChannelId,
        update,
      },
    },
  });

  getDataOrThrow(response);
};

export const updateCalendarChannel = async (
  calendarChannelId: string,
  update: CalendarChannelUpdate,
): Promise<void> => {
  const response = await makeMetadataAPIRequest({
    query: gql`
      mutation UpdateCalendarChannelForTest(
        $input: UpdateCalendarChannelInput!
      ) {
        updateCalendarChannel(input: $input) {
          id
        }
      }
    `,
    variables: {
      input: {
        id: calendarChannelId,
        update,
      },
    },
  });

  getDataOrThrow(response);
};

export const startChannelSync = async (
  connectedAccountId: string,
): Promise<void> => {
  const response = await makeMetadataAPIRequest({
    query: gql`
      mutation StartChannelSyncForTest($connectedAccountId: UUID!) {
        startChannelSync(connectedAccountId: $connectedAccountId) {
          success
        }
      }
    `,
    variables: { connectedAccountId },
  });

  getDataOrThrow(response);
};

export const deleteConnectedAccount = async (
  connectedAccountId: string,
): Promise<void> => {
  const response = await makeMetadataAPIRequest({
    query: gql`
      mutation DeleteConnectedAccountForTest($id: UUID!) {
        deleteConnectedAccount(id: $id) {
          id
        }
      }
    `,
    variables: { id: connectedAccountId },
  });

  getDataOrThrow(response);
};
