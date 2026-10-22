import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import { EMAIL_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { EmailingDomainExceptionCode } from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const WORKSPACE_SCHEMA = `"${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"`;
const MESSAGE_CAMPAIGN_TABLE = `${WORKSPACE_SCHEMA}."messageCampaign"`;
const MESSAGE_LIST_TABLE = `${WORKSPACE_SCHEMA}."messageList"`;
const MESSAGE_LIST_MEMBER_TABLE = `${WORKSPACE_SCHEMA}."messageListMember"`;
const PERSON_TABLE = `${WORKSPACE_SCHEMA}."person"`;

const PREVIEW_MESSAGE_CAMPAIGN_SEND = gql`
  query PreviewMessageCampaignSend($input: PreviewMessageCampaignSendInput!) {
    previewMessageCampaignSend(input: $input) {
      audience {
        totalMembers
        sendable
      }
      blockers {
        code
        message
      }
    }
  }
`;

const SENDABLE_BODY_TEMPLATE = JSON.stringify({
  type: 'doc',
  attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
});

describe('previewMessageCampaignSend (integration)', () => {
  const domain = `${v4()}.example.com`;
  const listId = v4();
  const trashedListId = v4();
  const personId = v4();
  const memberId = v4();
  const seededCampaignIds: string[] = [];
  let wasMessageCampaignEnabled: boolean;

  const seedCampaign = async ({
    subject,
    listId,
  }: {
    subject: string | null;
    listId: string | null;
  }): Promise<string> => {
    const campaignId = v4();

    await testDataSource.query(
      `INSERT INTO ${MESSAGE_CAMPAIGN_TABLE}
         ("id", "name", "status", "subject", "bodyTemplate", "fromAddressPrimaryEmail", "listId")
       VALUES ($1, $2, 'DRAFT', $3, $4, $5, $6)`,
      [
        campaignId,
        `Send preview ${campaignId}`,
        subject,
        SENDABLE_BODY_TEMPLATE,
        `campaigns@${domain}`,
        listId,
      ],
    );

    seededCampaignIds.push(campaignId);

    return campaignId;
  };

  const previewSend = async (campaignId: string) => {
    const response = await makeMetadataApiRequest({
      query: PREVIEW_MESSAGE_CAMPAIGN_SEND,
      variables: { input: { campaignId } },
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.previewMessageCampaignSend;
  };

  beforeAll(async () => {
    wasMessageCampaignEnabled =
      await getAppProviderByClassName<FeatureFlagService>(
        'FeatureFlagService',
      ).isFeatureEnabled(
        FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED,
        SEED_APPLE_WORKSPACE_ID,
      );

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED,
      value: true,
      expectToFail: false,
    });

    await testDataSource.query(
      `INSERT INTO "core"."emailingDomain"
         ("workspaceId", "domain", "status", "verifiedAt", "unsubscribeHostname", "unsubscribeHostnameStatus")
       VALUES ($1, $2, 'VERIFIED', now(), $3, 'ACTIVE')`,
      [SEED_APPLE_WORKSPACE_ID, domain, `unsubscribe.${domain}`],
    );

    await testDataSource.query(
      `INSERT INTO ${MESSAGE_LIST_TABLE} ("id", "name", "deletedAt")
       VALUES ($1, 'Send preview list', NULL), ($2, 'Trashed send preview list', now())`,
      [listId, trashedListId],
    );

    await testDataSource.query(
      `INSERT INTO ${PERSON_TABLE} ("id", "emailsPrimaryEmail")
       VALUES ($1, $2)`,
      [personId, `send-preview-${personId}@example.com`],
    );

    await testDataSource.query(
      `INSERT INTO ${MESSAGE_LIST_MEMBER_TABLE} ("id", "listId", "personId")
       VALUES ($1, $2, $3)`,
      [memberId, listId, personId],
    );
  });

  afterAll(async () => {
    if (seededCampaignIds.length > 0) {
      await testDataSource.query(
        `DELETE FROM ${MESSAGE_CAMPAIGN_TABLE} WHERE "id" = ANY($1)`,
        [seededCampaignIds],
      );
    }

    await testDataSource.query(
      `DELETE FROM ${MESSAGE_LIST_MEMBER_TABLE} WHERE "id" = $1`,
      [memberId],
    );
    await testDataSource.query(`DELETE FROM ${PERSON_TABLE} WHERE "id" = $1`, [
      personId,
    ]);
    await testDataSource.query(
      `DELETE FROM ${MESSAGE_LIST_TABLE} WHERE "id" = ANY($1)`,
      [[listId, trashedListId]],
    );
    await testDataSource.query(
      `DELETE FROM "core"."emailingDomain" WHERE "domain" = $1`,
      [domain],
    );

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED,
      value: wasMessageCampaignEnabled,
      expectToFail: false,
    });
  });

  it('asks for the list first when a draft has neither a list nor a subject', async () => {
    const campaignId = await seedCampaign({ subject: null, listId: null });

    expect(await previewSend(campaignId)).toEqual({
      audience: null,
      blockers: [
        {
          code: EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
          message: 'Pick a list in the To field first.',
        },
      ],
    });
  });

  it('blocks a campaign whose list is in the trash', async () => {
    const campaignId = await seedCampaign({
      subject: 'Monthly newsletter',
      listId: trashedListId,
    });

    expect(await previewSend(campaignId)).toEqual({
      audience: null,
      blockers: [
        {
          code: EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
          message:
            "This campaign's list is in the trash. Restore it or pick another list in the To field.",
        },
      ],
    });
  });

  it('reports no blocker and the recipient count for a ready campaign', async () => {
    const campaignId = await seedCampaign({
      subject: 'Monthly newsletter',
      listId,
    });

    expect(await previewSend(campaignId)).toEqual({
      audience: { totalMembers: 1, sendable: 1 },
      blockers: [],
    });
  });
});
