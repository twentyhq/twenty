import { gql } from 'graphql-tag';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { loginAsTwentyCli } from 'test/integration/metadata/suites/application/utils/login-as-twenty-cli.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { CALENDAR_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/calendar-channel-seed-ids.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { CONNECTED_ACCOUNT_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/connected-account-data-seeds.constant';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

type PublicCalendarChannel = {
  id: string;
  handle: string;
  visibility: string;
  connectedAccountId: string;
  connectedAccount: { id: string; userWorkspaceId: string };
};

const CALENDAR_CHANNELS_QUERY = {
  query: gql`
    query CalendarChannels {
      calendarChannels {
        id
        handle
        visibility
        connectedAccountId
        connectedAccount {
          id
          userWorkspaceId
        }
      }
    }
  `,
};

const OTHER_WORKSPACE_USER_WORKSPACE_IDS = [
  USER_WORKSPACE_DATA_SEED_IDS.JANE_ACME,
  USER_WORKSPACE_DATA_SEED_IDS.TIM_ACME,
  USER_WORKSPACE_DATA_SEED_IDS.JONY_ACME,
  USER_WORKSPACE_DATA_SEED_IDS.PHIL_ACME,
];

const expectRefused = (response: {
  body: { data?: unknown; errors?: { extensions?: { code?: string } }[] };
}) => {
  expect(response.body.data).toBeNull();
  expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
};

describe('calendarChannels', () => {
  let applicationWithFlag: ApplicationWithVariable;
  let applicationWithoutFlag: ApplicationWithVariable;
  let isTwentyCliInstalled = false;

  beforeAll(async () => {
    [applicationWithFlag, applicationWithoutFlag] = await Promise.all([
      setupApplicationWithVariable({
        name: 'Calendar Channels Reader',
        variableKey: 'UNUSED',
        permissionFlagUniversalIdentifiers: [
          SystemPermissionFlag.READ_PRIVATE_CHANNELS,
        ],
      }),
      setupApplicationWithVariable({
        name: 'Calendar Channels Without Flag',
        variableKey: 'UNUSED',
        permissionFlagUniversalIdentifiers: [],
      }),
    ]);
  }, 120000);

  afterAll(async () => {
    await Promise.all(
      [applicationWithFlag, applicationWithoutFlag]
        .filter(isDefined)
        .map(({ universalIdentifier }) =>
          cleanupApplicationAndAppRegistration({
            applicationUniversalIdentifier: universalIdentifier,
          }),
        ),
    );

    if (isTwentyCliInstalled) {
      await uninstallApplication({
        universalIdentifier:
          TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
        expectToFail: false,
      });
    }
  });

  it('should return the public info and owner of every calendar channel of the workspace to an application with the flag', async () => {
    const { applicationAccessToken } = await generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: applicationWithFlag.id,
    });

    const response = await makeMetadataApiRequest(
      CALENDAR_CHANNELS_QUERY,
      applicationAccessToken.token,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.calendarChannels).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: CALENDAR_CHANNEL_DATA_SEED_IDS.JANE,
          handle: 'jane.austen@apple.dev',
          connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.JANE,
          connectedAccount: {
            id: CONNECTED_ACCOUNT_DATA_SEED_IDS.JANE,
            userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
          },
        }),
        expect.objectContaining({
          id: CALENDAR_CHANNEL_DATA_SEED_IDS.JONY,
          handle: 'jony@apple.dev',
          connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY,
          connectedAccount: {
            id: CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY,
            userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
          },
        }),
        expect.objectContaining({
          id: CALENDAR_CHANNEL_DATA_SEED_IDS.TEAM_CALENDAR,
          handle: 'team-calendar@apple.dev',
          connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.TIM,
          connectedAccount: {
            id: CONNECTED_ACCOUNT_DATA_SEED_IDS.TIM,
            userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
          },
        }),
      ]),
    );
  });

  it('should never return calendar channels of another workspace', async () => {
    const { applicationAccessToken } = await generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: applicationWithFlag.id,
    });

    const response = await makeMetadataApiRequest(
      CALENDAR_CHANNELS_QUERY,
      applicationAccessToken.token,
    );

    const ownerUserWorkspaceIds = response.body.data.calendarChannels.map(
      ({ connectedAccount }: PublicCalendarChannel) =>
        connectedAccount.userWorkspaceId,
    );

    expect(ownerUserWorkspaceIds.length).toBeGreaterThan(0);
    for (const otherWorkspaceUserWorkspaceId of OTHER_WORKSPACE_USER_WORKSPACE_IDS) {
      expect(ownerUserWorkspaceIds).not.toContain(
        otherWorkspaceUserWorkspaceId,
      );
    }
  });

  it('should not expose sync state or member settings', async () => {
    const { applicationAccessToken } = await generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: applicationWithFlag.id,
    });

    const response = await makeMetadataApiRequest(
      {
        query: gql`
          query CalendarChannels {
            calendarChannels {
              id
              syncStatus
              excludePrivateEvents
            }
          }
        `,
      },
      applicationAccessToken.token,
    );

    expect(response.body.errors?.[0]?.extensions?.code).toBe(
      'GRAPHQL_VALIDATION_FAILED',
    );
  });

  it('should refuse an application without the flag', async () => {
    const { applicationAccessToken } = await generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: applicationWithoutFlag.id,
    });

    expectRefused(
      await makeMetadataApiRequest(
        CALENDAR_CHANNELS_QUERY,
        applicationAccessToken.token,
      ),
    );
  });

  it('should refuse an application token bound to a member, even with the flag', async () => {
    const { applicationAccessToken } =
      await generateAppleAdminApplicationTokenPair({
        applicationId: applicationWithFlag.id,
      });

    expectRefused(
      await makeMetadataApiRequest(
        CALENDAR_CHANNELS_QUERY,
        applicationAccessToken.token,
      ),
    );
  });

  it('should refuse a member session', async () => {
    expectRefused(
      await makeMetadataApiRequest(
        CALENDAR_CHANNELS_QUERY,
        APPLE_JANE_ADMIN_ACCESS_TOKEN,
      ),
    );
  });

  it('should refuse an API key', async () => {
    expectRefused(
      await makeMetadataApiRequest(
        CALENDAR_CHANNELS_QUERY,
        API_KEY_ACCESS_TOKEN,
      ),
    );
  });

  it('should refuse an OAuth client', async () => {
    const oauthClientToken = await loginAsTwentyCli();

    isTwentyCliInstalled = true;

    expectRefused(
      await makeMetadataApiRequest(CALENDAR_CHANNELS_QUERY, oauthClientToken),
    );
  });
});
