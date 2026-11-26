import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { arrangeMemberWithPermissionFlags } from 'test/integration/graphql/utils/arrange-member-with-permission-flags.util';
import { findCurrentWorkspaceInstalledApplication } from 'test/integration/graphql/utils/find-current-workspace-installed-application.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationWithResources } from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { setupApplicationWithVariable } from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { isDefined } from 'twenty-shared/utils';

import { CALENDAR_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/calendar-channel-seed-ids.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { CONNECTED_ACCOUNT_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/connected-account-data-seeds.constant';

// Where a looser root returns the type, a member without permission flags reaches
// the fields through it; otherwise the fields are reached through their own roots
describe('Field resolvers of a resolver class whose root operations require a stricter policy', () => {
  it('should resolve the Application fields for a member without permission flag', async () => {
    const application = await setupApplicationWithVariable({
      name: `Field resolver ${randomUUID().slice(0, 8)}`,
      variableKey: 'FIELD_RESOLVER',
    });
    const member = await arrangeMemberWithPermissionFlags({
      permissionFlagKeys: [],
    });

    try {
      expect(
        await findCurrentWorkspaceInstalledApplication({
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
    const member = await arrangeMemberWithPermissionFlags({
      permissionFlagKeys: [],
    });

    try {
      expect(
        await findCurrentWorkspaceInstalledApplication({
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
    const member = await arrangeMemberWithPermissionFlags({
      permissionFlagKeys: [],
    });

    try {
      expect(
        await findCurrentWorkspaceInstalledApplication({
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
    const member = await arrangeMemberWithPermissionFlags({
      permissionFlagKeys: [],
    });

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
    const member = await arrangeMemberWithPermissionFlags({
      permissionFlagKeys: [],
    });

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

  it('should resolve the AgentChatThread fields through their own root, the only one returning the type', async () => {
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
      const threadId = response.body.data?.createChatThread?.id;

      if (isDefined(threadId)) {
        await destroyAgentChatThread({ threadId });
      }
    }
  });

  it('should resolve the DpaAgreement field through its own root, the only one returning the type', async () => {
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

  it('should resolve the CalendarChannel field through its own root, the only one returning the type', async () => {
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
