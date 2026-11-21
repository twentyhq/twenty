import { gql } from 'graphql-tag';
import { ALLOWED_ORIGIN } from 'test/integration/graphql/suites/auth/user-sessions/constants/session-origins.constants';
import {
  extractSessionCookie,
  postMetadataOperationWithHeaders,
  signInWithCookieCapture,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/sign-in-with-cookie-capture.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { AGENT_CHAT_INBOX_NOTIFICATION_LEVEL } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

const updateInboxNotificationSettings = ({
  cookieHeader,
  inboxNotificationLevel,
}: {
  cookieHeader: string;
  inboxNotificationLevel: string;
}) =>
  postMetadataOperationWithHeaders(
    {
      query: gql`
        mutation UpdateInboxNotificationSettings(
          $input: UpdateInboxNotificationSettingsInput!
        ) {
          updateInboxNotificationSettings(input: $input) {
            id
            inboxNotificationLevel
            isInboxNotificationPreviewEnabled
          }
        }
      `,
      variables: {
        input: {
          inboxNotificationLevel,
          isInboxNotificationPreviewEnabled: false,
        },
      },
    },
    { originHeader: ALLOWED_ORIGIN, cookieHeader },
  );

const signInCookieHeader = async (email: string) => {
  const sessionCookie = extractSessionCookie(
    await signInWithCookieCapture({ email, originHeader: ALLOWED_ORIGIN }),
  );

  if (!isDefined(sessionCookie)) {
    throw new Error('Expected a session cookie');
  }

  return sessionCookie.cookieHeader;
};

describe('inbox notification settings (integration)', () => {
  let updatedUserWorkspaceId: string | undefined;

  afterEach(async () => {
    if (!isDefined(updatedUserWorkspaceId)) {
      return;
    }

    await getCoreRepository<UserWorkspaceEntity>(UserWorkspaceEntity).update(
      { id: updatedUserWorkspaceId },
      {
        inboxNotificationLevel:
          AGENT_CHAT_INBOX_NOTIFICATION_LEVEL.ALL_FOLLOWED,
        isInboxNotificationPreviewEnabled: true,
      },
    );
    updatedUserWorkspaceId = undefined;
  });

  it('should save the settings on the caller user workspace', async () => {
    const response = await updateInboxNotificationSettings({
      cookieHeader: await signInCookieHeader('tim@apple.dev'),
      inboxNotificationLevel:
        AGENT_CHAT_INBOX_NOTIFICATION_LEVEL.DIRECT_MENTIONS_AND_ASSIGNED,
    });

    const updatedUserWorkspace =
      response.body.data.updateInboxNotificationSettings;

    updatedUserWorkspaceId = updatedUserWorkspace.id;

    const expectedSettings = {
      inboxNotificationLevel:
        AGENT_CHAT_INBOX_NOTIFICATION_LEVEL.DIRECT_MENTIONS_AND_ASSIGNED,
      isInboxNotificationPreviewEnabled: false,
    };

    expect(updatedUserWorkspace).toMatchObject(expectedSettings);
    expect(
      await getCoreRepository<UserWorkspaceEntity>(
        UserWorkspaceEntity,
      ).findOneByOrFail({ id: updatedUserWorkspace.id }),
    ).toMatchObject(expectedSettings);
  });

  it('should refuse an unknown notification level', async () => {
    const response = await updateInboxNotificationSettings({
      cookieHeader: await signInCookieHeader('tim@apple.dev'),
      inboxNotificationLevel: 'EVERY_MESSAGE',
    });

    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});
