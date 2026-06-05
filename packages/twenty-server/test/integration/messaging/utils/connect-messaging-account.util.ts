import gql from 'graphql-tag';
import request from 'supertest';
import {
  CalendarChannelVisibility,
  ConnectedAccountProvider,
  MessageChannelVisibility,
} from 'twenty-shared/types';

import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import {
  deleteConnectedAccount,
  getDataOrThrow,
  queryCalendarChannels,
  queryMessageChannels,
} from 'test/integration/messaging/utils/query-messaging.util';

type ConnectMessagingAccountInput = {
  provider: ConnectedAccountProvider;
  handle: string;
  skipChannelConfiguration?: boolean;
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

const generateTransientToken = async (): Promise<string> => {
  const response = await makeMetadataAPIRequest({
    query: gql`
      mutation GenerateTransientToken {
        generateTransientToken {
          transientToken {
            token
          }
        }
      }
    `,
  });

  const data = getDataOrThrow(response) as {
    generateTransientToken: { transientToken: { token: string } };
  };

  return data.generateTransientToken.transientToken.token;
};

// With skipChannelConfiguration (the default), the channels land in the
// list-fetch-pending stage, ready for the next cron tick. Pass false to land
// them in PENDING_CONFIGURATION instead, configure them, then start syncing
// through the startChannelSync mutation, as the product does.
export const connectMessagingAccount = async ({
  provider,
  handle,
  skipChannelConfiguration = true,
}: ConnectMessagingAccountInput): Promise<ConnectMessagingAccountResult> => {
  const callbackPath = OAUTH_CALLBACK_PATH[provider];

  if (!callbackPath) {
    throw new Error(`Unsupported OAuth provider: ${provider}`);
  }

  const state = JSON.stringify({
    transientToken: await generateTransientToken(),
    messageVisibility: MessageChannelVisibility.SHARE_EVERYTHING,
    calendarVisibility: CalendarChannelVisibility.SHARE_EVERYTHING,
    skipMessageChannelConfiguration: skipChannelConfiguration,
  });

  const callbackResponse = await request(`http://localhost:${APP_PORT}`)
    .get(callbackPath)
    .query({ code: 'mock-authorization-code', state });

  const connectedChannel = (await queryMessageChannels()).find(
    (channel) => channel.handle === handle,
  );

  if (!connectedChannel) {
    throw new Error(
      `OAuth connect for ${provider} created no message channel for ${handle} (callback redirected to ${callbackResponse.headers.location})`,
    );
  }

  const [calendarChannel] = await queryCalendarChannels(
    connectedChannel.connectedAccountId,
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
    cleanup: () => deleteConnectedAccount(connectedChannel.connectedAccountId),
  };
};
