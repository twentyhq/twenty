import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { arrangeMemberWithPermissionFlags } from 'test/integration/graphql/utils/arrange-member-with-permission-flags.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { readFrontMetadataDocument } from 'test/integration/graphql/utils/read-front-metadata-document.util';
import { setWorkspaceActivationStatus } from 'test/integration/graphql/utils/set-workspace-activation-status.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationWithResources } from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { setupApplicationWithVariable } from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { AuthExceptionCode } from 'src/engine/core-modules/auth/auth.exception';
import { CALENDAR_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/calendar-channel-seed-ids.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { CONNECTED_ACCOUNT_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/connected-account-data-seeds.constant';

type ArrangedPrincipal = { token: string; cleanup: () => Promise<void> };

type GraphqlErrorBody = {
  path?: (string | number)[];
  extensions?: { code?: string; subCode?: string };
};

type FrontDocumentName =
  | 'GetCurrentUser'
  | 'ObjectMetadataItems'
  | 'FindAllViews';

type InstalledApplication = {
  id: string;
  [fieldName: string]: unknown;
};

const NO_CLEANUP = async () => {};

const arrangeWorkspaceCustomApplicationToken = async ({
  isBoundToUser,
}: {
  isBoundToUser: boolean;
}): Promise<ArrangedPrincipal> => {
  const [{ workspaceCustomApplicationId }] =
    await globalThis.testDataSource.query(
      'SELECT "workspaceCustomApplicationId" FROM core."workspace" WHERE id = $1',
      [SEED_APPLE_WORKSPACE_ID],
    );

  const { applicationAccessToken } = await generateApplicationTokenPair({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    applicationId: workspaceCustomApplicationId,
    ...(isBoundToUser
      ? {
          userId: USER_DATA_SEED_IDS.JANE,
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
        }
      : {}),
  });

  return { token: applicationAccessToken.token, cleanup: NO_CLEANUP };
};

// Roles without any permission flag: the caller the looser roots admit and the
// policies of the root operations in the same resolver classes refuse.
const arrangeMemberWithoutPermissionFlags = () =>
  arrangeMemberWithPermissionFlags({ permissionFlagKeys: [] });

const PRINCIPALS: {
  title: string;
  arrange: () => Promise<ArrangedPrincipal>;
}[] = [
  {
    title: 'an admin',
    arrange: async () => ({
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      cleanup: NO_CLEANUP,
    }),
  },
  {
    title: 'a member whose role holds no permission flag',
    arrange: arrangeMemberWithoutPermissionFlags,
  },
  {
    title: 'a guest',
    arrange: async () => ({
      token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
      cleanup: NO_CLEANUP,
    }),
  },
  {
    title: 'an API key',
    arrange: async () => ({ token: API_KEY_ACCESS_TOKEN, cleanup: NO_CLEANUP }),
  },
  {
    title: 'an application token bound to a user',
    arrange: () =>
      arrangeWorkspaceCustomApplicationToken({ isBoundToUser: true }),
  },
  {
    title: 'an application token without user',
    arrange: () =>
      arrangeWorkspaceCustomApplicationToken({ isBoundToUser: false }),
  },
];

const FRONT_DOCUMENT_NAMES: FrontDocumentName[] = [
  'GetCurrentUser',
  'ObjectMetadataItems',
  'FindAllViews',
];

// currentUser serves user sessions only, with or without guards on field resolvers
const ROOT_REFUSALS: Record<FrontDocumentName, string[]> = {
  GetCurrentUser: [
    'an API key',
    'an application token bound to a user',
    'an application token without user',
  ],
  ObjectMetadataItems: [],
  FindAllViews: [],
};

const isFieldLevelError = ({ path }: GraphqlErrorBody) =>
  (path?.length ?? 0) > 1;

const setSeedWorkspaceActivationStatus = async (
  activationStatus: WorkspaceActivationStatus,
) => {
  await setWorkspaceActivationStatus({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    activationStatus,
  });
  await getAppProviderByClassName<CoreEntityCacheService>(
    'CoreEntityCacheService',
  ).invalidate('workspaceEntity', SEED_APPLE_WORKSPACE_ID);
};

const findInstalledApplication = async ({
  applicationId,
  gqlFields,
  token,
}: {
  applicationId: string;
  gqlFields: string;
  token: string;
}): Promise<InstalledApplication | undefined> => {
  const response = await makeMetadataApiRequest(
    {
      query: gql`
        query CurrentWorkspaceInstalledApplications {
          currentWorkspace {
            id
            installedApplications {
              id
              ${gqlFields}
            }
          }
        }
      `,
    },
    token,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.currentWorkspace.installedApplications.find(
    ({ id }: InstalledApplication) => id === applicationId,
  );
};

describe('Field resolvers under an admitted root operation', () => {
  describe.each(FRONT_DOCUMENT_NAMES)(
    'the %s document of twenty-front',
    (documentName) => {
      it.each(PRINCIPALS)(
        'should answer $title as the root operation does',
        async ({ title, arrange }) => {
          const principal = await arrange();

          try {
            const response = await makeMetadataApiRequest(
              { query: readFrontMetadataDocument(documentName) },
              principal.token,
            );
            const errors: GraphqlErrorBody[] = response.body.errors ?? [];

            expect(errors.filter(isFieldLevelError)).toEqual([]);

            if (ROOT_REFUSALS[documentName].includes(title)) {
              expect(response.body.data).toBeNull();
              expect(errors.length).toBeGreaterThan(0);
              expect(errors.map(({ extensions }) => extensions?.code)).toEqual(
                errors.map(() => 'FORBIDDEN'),
              );
            } else {
              expect(errors).toEqual([]);
              expect(response.body.data).not.toBeNull();
            }
          } finally {
            await principal.cleanup();
          }
        },
      );
    },
  );

  it('should answer GetCurrentUser in a suspended workspace, where other root operations stay refused', async () => {
    await setSeedWorkspaceActivationStatus(WorkspaceActivationStatus.SUSPENDED);

    try {
      const appLoadResponse = await makeMetadataApiRequest({
        query: readFrontMetadataDocument('GetCurrentUser'),
      });
      const refusedRootResponse = await makeMetadataApiRequest({
        query: gql`
          query CurrentWorkspace {
            currentWorkspace {
              id
            }
          }
        `,
      });

      expect(appLoadResponse.body.errors).toBeUndefined();
      expect(
        appLoadResponse.body.data.currentUser.currentWorkspace,
      ).toMatchObject({
        id: SEED_APPLE_WORKSPACE_ID,
        activationStatus: WorkspaceActivationStatus.SUSPENDED,
        featureFlags: expect.any(Array),
        workspaceUrls: expect.any(Object),
      });
      expect(refusedRootResponse.body.data).toBeNull();
      expect(refusedRootResponse.body.errors).toEqual([
        expect.objectContaining({
          extensions: expect.objectContaining({
            subCode: AuthExceptionCode.WORKSPACE_SUSPENDED,
          }),
        }),
      ]);
    } finally {
      await setSeedWorkspaceActivationStatus(WorkspaceActivationStatus.ACTIVE);
    }
  });

  describe('of a resolver class whose root operations require a stricter policy', () => {
    it('should resolve the Application fields for a member without permission flag', async () => {
      const application = await setupApplicationWithVariable({
        name: `Field resolver ${randomUUID().slice(0, 8)}`,
        variableKey: 'FIELD_RESOLVER',
      });
      const member = await arrangeMemberWithoutPermissionFlags();

      try {
        expect(
          await findInstalledApplication({
            applicationId: application.id,
            token: member.token,
            gqlFields: `
              logoUrl
              description
              grantRoleId
              defaultRoleId
              runHealthCheckOnUserPreferences
              isUninstallBlockedByOtherWorkspaceInstallations
              agents { id }
              frontComponents { id }
              commandMenuItems { id }
              settingsMenuItems { id }
              logicFunctions { id }
              objects { id }
              content { objects { id } }
              applicationVariables { key }
            `,
          }),
        ).toEqual({
          id: application.id,
          logoUrl: null,
          description: expect.anything(),
          grantRoleId: expect.any(String),
          defaultRoleId: null,
          runHealthCheckOnUserPreferences: expect.any(Boolean),
          isUninstallBlockedByOtherWorkspaceInstallations: false,
          agents: [],
          frontComponents: [],
          commandMenuItems: [],
          settingsMenuItems: [],
          logicFunctions: [],
          objects: [],
          content: expect.objectContaining({ objects: [] }),
          applicationVariables: [{ key: 'FIELD_RESOLVER' }],
        });
      } finally {
        await member.cleanup();
        await cleanupApplicationAndAppRegistration({
          applicationUniversalIdentifier: application.universalIdentifier,
        });
      }
    });

    it('should resolve the Application iframe media permission fields for a member without permission flag', async () => {
      const application = await setupApplicationWithVariable({
        name: `Field resolver ${randomUUID().slice(0, 8)}`,
        variableKey: 'FIELD_RESOLVER',
      });
      const member = await arrangeMemberWithoutPermissionFlags();

      try {
        expect(
          await findInstalledApplication({
            applicationId: application.id,
            token: member.token,
            gqlFields: `
              requestedIframeMediaPermissions { origin microphone camera }
              grantedIframeMediaPermissions { origin microphone camera }
            `,
          }),
        ).toEqual({
          id: application.id,
          requestedIframeMediaPermissions: [],
          grantedIframeMediaPermissions: [],
        });
      } finally {
        await member.cleanup();
        await cleanupApplicationAndAppRegistration({
          applicationUniversalIdentifier: application.universalIdentifier,
        });
      }
    });

    it('should resolve the ApplicationVariable field for a member without permission flag', async () => {
      const application = await setupApplicationWithVariable({
        name: `Field resolver ${randomUUID().slice(0, 8)}`,
        variableKey: 'FIELD_RESOLVER',
        value: 'field-resolver-value',
      });
      const member = await arrangeMemberWithoutPermissionFlags();

      try {
        expect(
          await findInstalledApplication({
            applicationId: application.id,
            token: member.token,
            gqlFields: 'applicationVariables { key value }',
          }),
        ).toEqual({
          id: application.id,
          applicationVariables: [
            { key: 'FIELD_RESOLVER', value: 'field-resolver-value' },
          ],
        });
      } finally {
        await member.cleanup();
        await cleanupApplicationAndAppRegistration({
          applicationUniversalIdentifier: application.universalIdentifier,
        });
      }
    });

    it('should resolve the ApplicationConnectionProvider field for a member without permission flag', async () => {
      const application = await setupApplicationWithResources({
        name: `Field resolver ${randomUUID().slice(0, 8)}`,
      });
      const member = await arrangeMemberWithoutPermissionFlags();

      try {
        const response = await makeMetadataApiRequest(
          {
            query: gql`
              query ApplicationConnectionProviders($applicationId: UUID!) {
                applicationConnectionProviders(applicationId: $applicationId) {
                  name
                  logoUrl
                }
              }
            `,
            variables: { applicationId: application.id },
          },
          member.token,
        );

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.applicationConnectionProviders).toEqual([
          { name: application.connectionProviderName, logoUrl: null },
        ]);
      } finally {
        await member.cleanup();
        await cleanupApplicationAndAppRegistration({
          applicationUniversalIdentifier: application.universalIdentifier,
        });
      }
    });

    it('should resolve the Index fields for a member without permission flag', async () => {
      const member = await arrangeMemberWithoutPermissionFlags();

      try {
        const response = await makeMetadataApiRequest(
          {
            query: gql`
              query ObjectsWithIndexes {
                objects(paging: { first: 5 }) {
                  edges {
                    node {
                      id
                      indexMetadataList {
                        id
                        isCustom
                        indexFieldMetadataList {
                          id
                        }
                      }
                    }
                  }
                }
              }
            `,
          },
          member.token,
        );

        const indexes = (response.body.data?.objects.edges ?? []).flatMap(
          ({ node }: { node: { indexMetadataList: unknown[] } }) =>
            node.indexMetadataList,
        );

        expect(response.body.errors).toBeUndefined();
        expect(indexes.length).toBeGreaterThan(0);
        expect(indexes).toEqual(
          expect.arrayContaining([
            {
              id: expect.any(String),
              isCustom: expect.any(Boolean),
              indexFieldMetadataList: expect.arrayContaining([
                { id: expect.any(String) },
              ]),
            },
          ]),
        );
      } finally {
        await member.cleanup();
      }
    });

    it('should resolve the AgentChatThread fields for an admin', async () => {
      const response = await makeMetadataApiRequest({
        query: gql`
          mutation CreateChatThread {
            createChatThread {
              id
              createdAt
              updatedAt
              deletedAt
              totalInputCredits
              totalOutputCredits
            }
          }
        `,
      });

      try {
        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.createChatThread).toEqual({
          id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          deletedAt: null,
          totalInputCredits: 0,
          totalOutputCredits: 0,
        });
      } finally {
        await destroyAgentChatThread({
          threadId: response.body.data.createChatThread.id,
        });
      }
    });

    it('should resolve the DpaAgreement field for an admin', async () => {
      const [{ id: agreementId }] = await globalThis.testDataSource.query(
        `INSERT INTO core."dpaAgreement"
           ("type", "templateVersion", "region", "processorEntity",
            "acceptedAt", "workspaceId")
         VALUES ('CLICK_THROUGH', 'test', 'EU', 'Test processor', now(), $1)
         RETURNING id`,
        [SEED_APPLE_WORKSPACE_ID],
      );

      try {
        const response = await makeGraphqlApiRequest({
          query: gql`
            query DpaAgreements {
              dpaAgreements {
                id
                downloadUrl
              }
            }
          `,
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.dpaAgreements).toContainEqual({
          id: agreementId,
          downloadUrl: null,
        });
      } finally {
        await globalThis.testDataSource.query(
          'DELETE FROM core."dpaAgreement" WHERE id = $1',
          [agreementId],
        );
      }
    });

    it('should resolve the CalendarChannel field for an admin', async () => {
      const response = await makeMetadataApiRequest({
        query: gql`
          query MyCalendarChannels {
            myCalendarChannels {
              id
              connectedAccount {
                id
              }
            }
          }
        `,
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.myCalendarChannels).toContainEqual({
        id: CALENDAR_CHANNEL_DATA_SEED_IDS.JANE,
        connectedAccount: { id: CONNECTED_ACCOUNT_DATA_SEED_IDS.JANE },
      });
    });
  });
});
