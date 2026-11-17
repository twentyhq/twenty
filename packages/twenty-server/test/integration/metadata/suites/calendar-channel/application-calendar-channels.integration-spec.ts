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

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

type CalendarChannelOwner = { id: string; userWorkspaceId: string };

const CALENDAR_CHANNELS_QUERY = {
  query: gql`
    query CalendarChannels {
      calendarChannels {
        id
        userWorkspaceId
      }
    }
  `,
};

const sortById = (calendarChannels: CalendarChannelOwner[]) =>
  [...calendarChannels].sort((a, b) => a.id.localeCompare(b.id));

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

  it('should return every calendar channel of the workspace with its owner to an application with the flag', async () => {
    const { applicationAccessToken } = await generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: applicationWithFlag.id,
    });

    const response = await makeMetadataApiRequest(
      CALENDAR_CHANNELS_QUERY,
      applicationAccessToken.token,
    );

    expect(response.body.errors).toBeUndefined();

    const expectedCalendarChannels: CalendarChannelOwner[] =
      await globalThis.testDataSource.query(
        `SELECT "calendarChannel".id, "connectedAccount"."userWorkspaceId"
           FROM core."calendarChannel" "calendarChannel"
           JOIN core."connectedAccount" "connectedAccount"
             ON "connectedAccount".id = "calendarChannel"."connectedAccountId"
          WHERE "calendarChannel"."workspaceId" = $1`,
        [SEED_APPLE_WORKSPACE_ID],
      );

    expect(expectedCalendarChannels.length).toBeGreaterThan(0);
    expect(sortById(response.body.data.calendarChannels)).toEqual(
      sortById(expectedCalendarChannels),
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

    const otherWorkspaceCalendarChannels: { id: string }[] =
      await globalThis.testDataSource.query(
        `SELECT id FROM core."calendarChannel" WHERE "workspaceId" <> $1`,
        [SEED_APPLE_WORKSPACE_ID],
      );

    const returnedIds = response.body.data.calendarChannels.map(
      ({ id }: CalendarChannelOwner) => id,
    );

    expect(otherWorkspaceCalendarChannels.length).toBeGreaterThan(0);
    for (const { id } of otherWorkspaceCalendarChannels) {
      expect(returnedIds).not.toContain(id);
    }
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
