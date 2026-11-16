import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { type ASTNode } from 'graphql';
import { callMcpTool } from 'test/integration/graphql/suites/application-role-intersection/utils/call-mcp-tool.util';
import { getMcpToolCatalog } from 'test/integration/graphql/suites/application-role-intersection/utils/get-mcp-tool-catalog.util';
import {
  type ImpersonatedAdminMember,
  createImpersonatedAdminMember,
} from 'test/integration/graphql/suites/impersonation/utils/create-impersonated-admin-member.util';
import { deleteUserFromWorkspace } from 'test/integration/graphql/suites/user-session/utils/delete-user-from-workspace.util';
import { generatePlaygroundToken } from 'test/integration/graphql/suites/user-session/utils/generate-playground-token.util';
import { updateUserEmail } from 'test/integration/graphql/suites/user-session/utils/update-user-email.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { impersonate } from 'test/integration/graphql/utils/impersonate.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { makeMetadataApiRequestWithFileUpload } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-file-upload.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { isDefined } from 'twenty-shared/utils';

import {
  type BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { AUTH_PRINCIPAL_REFUSED_MESSAGE } from 'src/engine/guards/constants/auth-principal-refused-message.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

type RefusedOperation = {
  title: string;
  query: ASTNode;
  variables?: Record<string, unknown>;
  // false when the call cannot succeed with throwaway arguments: the standard
  // session is then only expected to get past the session check.
  succeedsForStandardSession: boolean;
};

const REFUSED_OPERATIONS: RefusedOperation[] = [
  {
    title: 'currentUserSessions',
    query: gql`
      query {
        currentUserSessions {
          id
        }
      }
    `,
    succeedsForStandardSession: true,
  },
  {
    title: 'revokeUserSession',
    query: gql`
      mutation ($userSessionId: UUID!) {
        revokeUserSession(userSessionId: $userSessionId)
      }
    `,
    variables: { userSessionId: randomUUID() },
    succeedsForStandardSession: false,
  },
  {
    title: 'revokeAllOtherUserSessions',
    query: gql`
      mutation {
        revokeAllOtherUserSessions
      }
    `,
    succeedsForStandardSession: true,
  },
  {
    title: 'generateTransientToken',
    query: gql`
      mutation {
        generateTransientToken {
          transientToken {
            token
          }
        }
      }
    `,
    succeedsForStandardSession: true,
  },
  {
    title: 'generatePlaygroundToken',
    query: gql`
      mutation {
        generatePlaygroundToken {
          token
        }
      }
    `,
    succeedsForStandardSession: true,
  },
  {
    title: 'authorizeApp',
    query: gql`
      mutation (
        $clientId: String!
        $codeChallenge: String!
        $redirectUrl: String!
      ) {
        authorizeApp(
          clientId: $clientId
          codeChallenge: $codeChallenge
          redirectUrl: $redirectUrl
        ) {
          redirectUrl
        }
      }
    `,
    variables: {
      clientId: randomUUID(),
      codeChallenge: 'a'.repeat(43),
      redirectUrl: 'https://app.twenty.test/callback',
    },
    succeedsForStandardSession: false,
  },
  {
    title: 'revokeApplicationAuthorization',
    query: gql`
      mutation ($applicationAuthorizationId: UUID!) {
        revokeApplicationAuthorization(
          applicationAuthorizationId: $applicationAuthorizationId
        )
      }
    `,
    variables: { applicationAuthorizationId: randomUUID() },
    succeedsForStandardSession: true,
  },
  {
    title: 'checkWorkspaceSubdomainAvailability',
    query: gql`
      query ($subdomain: String!) {
        checkWorkspaceSubdomainAvailability(subdomain: $subdomain) {
          isValid
        }
      }
    `,
    variables: { subdomain: 'impersonation-probe' },
    succeedsForStandardSession: true,
  },
  {
    title: 'getWorkspaceCreationDefaults',
    query: gql`
      query {
        getWorkspaceCreationDefaults {
          subdomain
        }
      }
    `,
    succeedsForStandardSession: true,
  },
  {
    title: 'createNewWorkspaceLogoUpload',
    query: gql`
      mutation ($workspaceId: String!) {
        createNewWorkspaceLogoUpload(
          workspaceId: $workspaceId
          filename: "logo.png"
          size: 10
        ) {
          fileId
        }
      }
    `,
    variables: { workspaceId: randomUUID() },
    succeedsForStandardSession: false,
  },
  {
    title: 'completeNewWorkspaceLogoUpload',
    query: gql`
      mutation ($workspaceId: String!, $fileId: String!) {
        completeNewWorkspaceLogoUpload(
          workspaceId: $workspaceId
          fileId: $fileId
        ) {
          id
        }
      }
    `,
    variables: { workspaceId: randomUUID(), fileId: randomUUID() },
    succeedsForStandardSession: false,
  },
  {
    title: 'updateMyUserApplicationVariable',
    query: gql`
      mutation ($applicationUniversalIdentifier: String!) {
        updateMyUserApplicationVariable(
          applicationUniversalIdentifier: $applicationUniversalIdentifier
          key: "PROBE"
          value: "probe"
        )
      }
    `,
    variables: { applicationUniversalIdentifier: randomUUID() },
    succeedsForStandardSession: false,
  },
  {
    // Any user session is turned away after the session check: the handler
    // only serves application tokens.
    title: 'myUserApplicationVariables',
    query: gql`
      query {
        myUserApplicationVariables {
          userWorkspaceId
        }
      }
    `,
    succeedsForStandardSession: false,
  },
  {
    title: 'deleteConnectedAccount',
    query: gql`
      mutation ($id: UUID!) {
        deleteConnectedAccount(id: $id) {
          id
        }
      }
    `,
    variables: { id: randomUUID() },
    succeedsForStandardSession: false,
  },
  {
    title: 'disconnectConnectedAccount',
    query: gql`
      mutation ($id: UUID!) {
        disconnectConnectedAccount(id: $id) {
          id
        }
      }
    `,
    variables: { id: randomUUID() },
    succeedsForStandardSession: false,
  },
  {
    title: 'saveImapSmtpCaldavAccount',
    query: gql`
      mutation ($id: UUID!) {
        saveImapSmtpCaldavAccount(
          id: $id
          handle: "probe@twenty.test"
          connectionParameters: {}
        ) {
          success
        }
      }
    `,
    variables: { id: randomUUID() },
    succeedsForStandardSession: false,
  },
  {
    title: 'sendEmail',
    query: gql`
      mutation ($connectedAccountId: String!) {
        sendEmail(
          input: {
            connectedAccountId: $connectedAccountId
            to: "probe@twenty.test"
            subject: "probe"
            body: "probe"
          }
        ) {
          success
        }
      }
    `,
    variables: { connectedAccountId: randomUUID() },
    succeedsForStandardSession: false,
  },
  {
    title: 'sendAppChannelMessage',
    query: gql`
      mutation ($messageChannelId: UUID!, $messageThreadId: UUID!) {
        sendAppChannelMessage(
          input: {
            messageChannelId: $messageChannelId
            messageThreadId: $messageThreadId
            text: "probe"
            idempotencyKey: "probe"
          }
        ) {
          messageId
        }
      }
    `,
    variables: {
      messageChannelId: randomUUID(),
      messageThreadId: randomUUID(),
    },
    succeedsForStandardSession: false,
  },
  {
    title: 'createCalendarEvent',
    query: gql`
      mutation ($connectedAccountId: String!) {
        createCalendarEvent(
          input: {
            connectedAccountId: $connectedAccountId
            title: "probe"
            startsAt: "2030-01-01T10:00:00.000Z"
            endsAt: "2030-01-01T11:00:00.000Z"
          }
        ) {
          success
        }
      }
    `,
    variables: { connectedAccountId: randomUUID() },
    succeedsForStandardSession: false,
  },
];

const UPLOAD_NEW_WORKSPACE_LOGO = gql`
  mutation ($workspaceId: String!, $file: Upload!) {
    uploadNewWorkspaceLogo(workspaceId: $workspaceId, file: $file) {
      id
    }
  }
`;

const expectRefusedAsImpersonated = (
  errors: BaseGraphQLError[] | undefined,
) => {
  expect(errors).toHaveLength(1);
  expect(errors?.[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  expect(errors?.[0].message).toBe(AUTH_PRINCIPAL_REFUSED_MESSAGE);
};

const expectNotRefusedAsPrincipal = (
  errors: BaseGraphQLError[] | undefined,
) => {
  expect((errors ?? []).map(({ message }) => message)).not.toContain(
    AUTH_PRINCIPAL_REFUSED_MESSAGE,
  );
};

const listMcpToolNames = async (token: string): Promise<string[]> =>
  Object.values(await getMcpToolCatalog({ token })).flatMap((tools) =>
    tools.map(({ name }) => name),
  );

const countUserWorkspaces = (userId: string) =>
  getCoreRepository<UserWorkspaceEntity>(UserWorkspaceEntity).count({
    where: { userId },
  });

describe('Impersonated session - account-level operations denial (integration)', () => {
  let member: ImpersonatedAdminMember;

  beforeAll(async () => {
    member = await createImpersonatedAdminMember();
  }, 120000);

  afterAll(async () => {
    if (!isDefined(member)) {
      return;
    }

    const user = await getCoreRepository<UserEntity>(UserEntity).findOne({
      where: { id: member.userId },
    });

    if (isDefined(user)) {
      await deleteUserFromWorkspace({
        input: { workspaceMemberIdToDelete: member.workspaceMemberId },
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });
    }
  });

  describe.each(REFUSED_OPERATIONS)(
    '$title',
    ({ query, variables, succeedsForStandardSession }) => {
      it('is refused to the impersonated session', async () => {
        const response = await makeMetadataApiRequest(
          { query, variables },
          member.impersonationAccessToken,
        );

        expectRefusedAsImpersonated(response.body.errors);
      });

      it('is admitted for the standard session of the same member', async () => {
        const response = await makeMetadataApiRequest(
          { query, variables },
          member.standardAccessToken,
        );

        if (succeedsForStandardSession) {
          expect(response.body.errors).toBeUndefined();
        } else {
          expectNotRefusedAsPrincipal(response.body.errors);
        }
      });
    },
  );

  describe('uploadNewWorkspaceLogo', () => {
    const upload = (token: string) =>
      makeMetadataApiRequestWithFileUpload(
        {
          query: UPLOAD_NEW_WORKSPACE_LOGO,
          variables: { workspaceId: randomUUID(), file: null },
        },
        {
          field: 'file',
          buffer: Buffer.from('probe'),
          filename: 'logo.png',
          contentType: 'image/png',
        },
        token,
      );

    it('is refused to the impersonated session', async () => {
      const response = await upload(member.impersonationAccessToken);

      expectRefusedAsImpersonated(response.body.errors);
    });

    it('is admitted for the standard session of the same member', async () => {
      const response = await upload(member.standardAccessToken);

      expectNotRefusedAsPrincipal(response.body.errors);
    });
  });

  describe('updateUserEmail', () => {
    it('is refused to the impersonated session, and the email is unchanged', async () => {
      const { errors } = await updateUserEmail({
        input: { newEmail: `changed-${member.email}` },
        token: member.impersonationAccessToken,
        expectToFail: true,
      });

      expectRefusedAsImpersonated(errors);

      const user = await getCoreRepository<UserEntity>(UserEntity).findOne({
        where: { id: member.userId },
      });

      expect(user?.email).toBe(member.email);
    });

    // The unchanged address is turned down by the handler itself, which shows
    // the standard session reached it.
    it('is admitted for the standard session of the same member', async () => {
      const { errors } = await updateUserEmail({
        input: { newEmail: member.email },
        token: member.standardAccessToken,
        expectToFail: true,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe(
        'New email must be different from current email',
      );
    });
  });

  describe('removing oneself from the workspace', () => {
    it('is refused to the impersonated session, and the membership stays', async () => {
      const { errors } = await deleteUserFromWorkspace({
        input: { workspaceMemberIdToDelete: member.workspaceMemberId },
        token: member.impersonationAccessToken,
        expectToFail: true,
      });

      expectRefusedAsImpersonated(errors);
      expect(await countUserWorkspaces(member.userId)).toBe(1);
    });
  });

  // A playground token is first-person, so it is only minted for a standard session
  describe('playground token', () => {
    it('is minted for the standard session only', async () => {
      const { errors: impersonateErrors } = await impersonate({
        userId: USER_DATA_SEED_IDS.SCOTT,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        accessToken: member.impersonationAccessToken,
        expectToFail: true,
      });

      expectRefusedAsImpersonated(impersonateErrors);

      const { data, errors: playgroundTokenErrors } =
        await generatePlaygroundToken({
          token: member.impersonationAccessToken,
          expectToFail: true,
        });

      expectRefusedAsImpersonated(playgroundTokenErrors);
      expect(data?.generatePlaygroundToken).toBeUndefined();

      const { data: standardData } = await generatePlaygroundToken({
        token: member.standardAccessToken,
        expectToFail: false,
      });

      const { data: impersonateData, errors: impersonateWithPlaygroundErrors } =
        await impersonate({
          userId: USER_DATA_SEED_IDS.SCOTT,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          accessToken: standardData.generatePlaygroundToken.token,
          expectToFail: false,
        });

      expect(impersonateWithPlaygroundErrors).toBeUndefined();
      expect(impersonateData.impersonate.loginToken.token).toBeDefined();
    });
  });

  describe('tools acting as the person', () => {
    const SEND_AS_PERSON_TOOL_NAMES = ['send_email', 'create_calendar_event'];

    it('are offered to the standard session and withheld from the impersonated one', async () => {
      expect(await listMcpToolNames(member.standardAccessToken)).toEqual(
        expect.arrayContaining(SEND_AS_PERSON_TOOL_NAMES),
      );

      const impersonatedToolNames = await listMcpToolNames(
        member.impersonationAccessToken,
      );

      for (const toolName of SEND_AS_PERSON_TOOL_NAMES) {
        expect(impersonatedToolNames).not.toContain(toolName);
      }
    });

    it('cannot be executed by the impersonated session', async () => {
      const result = await callMcpTool({
        toolName: 'execute_tool',
        toolArguments: {
          toolName: 'send_email',
          arguments: {
            recipients: { to: 'probe@twenty.test' },
            subject: 'probe',
            body: 'probe',
          },
        },
        token: member.impersonationAccessToken,
      });

      expect(JSON.parse(result.content[0].text)).toMatchObject({
        success: false,
        message: 'Tool "send_email" not found',
      });
    });
  });

  // Last: these two succeed for the standard session and end the account.
  describe('account creation and deletion', () => {
    it('are refused to the impersonated session', async () => {
      const { errors: signUpErrors } = await signUpInNewWorkspace({
        accessToken: member.impersonationAccessToken,
        expectToFail: true,
      });

      expectRefusedAsImpersonated(signUpErrors);

      const { errors: deleteErrors } = await deleteUser({
        accessToken: member.impersonationAccessToken,
        expectToFail: true,
      });

      expectRefusedAsImpersonated(deleteErrors);
      expect(await countUserWorkspaces(member.userId)).toBe(1);
    });

    it('work for the standard session of the same member', async () => {
      const { data: signUpData, errors: signUpErrors } =
        await signUpInNewWorkspace({
          accessToken: member.standardAccessToken,
          expectToFail: false,
        });

      expect(signUpErrors).toBeUndefined();
      expect(await countUserWorkspaces(member.userId)).toBe(2);

      await globalThis.testDataSource.query(
        `DELETE FROM core."workspace" WHERE id = $1`,
        [signUpData.signUpInNewWorkspace.workspace.id],
      );

      const { errors: deleteErrors } = await deleteUser({
        accessToken: member.standardAccessToken,
        expectToFail: false,
      });

      expect(deleteErrors).toBeUndefined();
      expect(await countUserWorkspaces(member.userId)).toBe(0);
    });
  });
});
