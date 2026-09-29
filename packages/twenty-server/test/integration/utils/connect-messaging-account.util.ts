import request from 'supertest';

import {
  CalendarChannelVisibility,
  ConnectedAccountProvider,
  MessageChannelVisibility,
} from 'twenty-shared/types';

import { generateTransientToken } from 'test/integration/utils/generate-transient-token.util';
import {
  deleteConnectedAccount,
  queryCalendarChannels,
  queryMessageChannels,
} from 'test/integration/utils/query-messaging.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

type ConnectMessagingAccountInput = {
  provider: ConnectedAccountProvider;
  handle: string;
  skipChannelConfiguration?: boolean;
  // Connects on behalf of the member this access token belongs to.
  token?: string;
};

type ConnectMessagingAccountResult = {
  channelId: string;
  calendarChannelId: string;
  connectedAccountId: string;
  handle: string;
  cleanup: () => Promise<void>;
};

const OAUTH_CALLBACK_PATH: Partial<Record<ConnectedAccountProvider, string>> = {
  [ConnectedAccountProvider.GOOGLE]: '/auth/google-apis/get-access-token',
  [ConnectedAccountProvider.MICROSOFT]: '/auth/microsoft-apis/get-access-token',
};

export const connectMessagingAccount = async ({
  provider,
  handle,
  skipChannelConfiguration = true,
  token,
}: ConnectMessagingAccountInput): Promise<ConnectMessagingAccountResult> => {
  const callbackPath = OAUTH_CALLBACK_PATH[provider];

  if (!callbackPath) {
    throw new Error(`Unsupported OAuth provider: ${provider}`);
  }

  const state = JSON.stringify({
    transientToken: await generateTransientToken(token),
    messageVisibility: MessageChannelVisibility.SHARE_EVERYTHING,
    calendarVisibility: CalendarChannelVisibility.SHARE_EVERYTHING,
    skipMessageChannelConfiguration: skipChannelConfiguration,
  });

  const callbackResponse = await request(`http://localhost:${APP_PORT}`)
    .get(callbackPath)
    .query({ code: 'mock-authorization-code', state });

  await waitForAllJobsToFinish();

  const connectedChannel = (await queryMessageChannels(token)).find(
    (channel) => channel.handle === handle,
  );

  if (!connectedChannel) {
    throw new Error(
      `OAuth connect for ${provider} created no message channel for ${handle} (callback redirected to ${callbackResponse.headers.location})`,
    );
  }

  const [calendarChannel] = await queryCalendarChannels(
    connectedChannel.connectedAccountId,
    token,
  );

  if (!calendarChannel) {
    throw new Error(
      `OAuth connect for ${provider} created no calendar channel for ${handle}`,
    );
  }

  return {
    channelId: connectedChannel.id,
    calendarChannelId: calendarChannel.id,
    connectedAccountId: connectedChannel.connectedAccountId,
    handle,
    cleanup: () =>
      deleteConnectedAccount(connectedChannel.connectedAccountId, token),
  };
};
