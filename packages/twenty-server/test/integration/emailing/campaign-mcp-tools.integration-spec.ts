import gql from 'graphql-tag';
import { executeToolThroughMcp } from 'test/integration/ai/utils/execute-tool-through-mcp.util';
import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findOneOperation } from 'test/integration/graphql/utils/find-one-operation.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { EMAIL_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SENDABLE_BODY_TEMPLATE = JSON.stringify({
  type: 'doc',
  attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
});

const CREATE_MESSAGE_SUPPRESSION = gql`
  mutation CreateMessageSuppression($input: CreateMessageSuppressionInput!) {
    createMessageSuppression(input: $input) {
      id
    }
  }
`;

const DELETE_MESSAGE_SUPPRESSION = gql`
  mutation DeleteMessageSuppression($id: UUID!) {
    deleteMessageSuppression(id: $id)
  }
`;

const createRecord = async (
  objectMetadataSingularName: string,
  input: Record<string, unknown>,
) => {
  const { errors } = await createOneOperation({
    objectMetadataSingularName,
    input,
  });

  expect(errors).toBeUndefined();
};

const destroyRecord = (objectMetadataSingularName: string, recordId: string) =>
  makeGraphqlApiRequest(
    destroyOneOperationFactory({
      objectMetadataSingularName,
      gqlFields: 'id',
      recordId,
    }),
  );

describe('Campaign lifecycle tools through MCP (integration)', () => {
  const domain = `${v4()}.example.com`;
  const listId = v4();
  const personId = v4();
  const memberId = v4();
  const campaignId = v4();
  const suppressedEmailAddress = `mcp-suppressed-${v4()}@example.com`;
  let suppressionId: string;

  const readCampaignStatus = async (): Promise<string> => {
    const { data } = await findOneOperation({
      objectMetadataSingularName: 'messageCampaign',
      gqlFields: 'status',
      filter: { id: { eq: campaignId } },
    });

    return data.findResponse.status;
  };

  beforeAll(async () => {
    await testDataSource.query(
      `INSERT INTO "core"."emailingDomain"
         ("workspaceId", "domain", "status", "verifiedAt", "unsubscribeHostname", "unsubscribeHostnameStatus")
       VALUES ($1, $2, 'VERIFIED', now(), $3, 'ACTIVE')`,
      [SEED_APPLE_WORKSPACE_ID, domain, `unsubscribe.${domain}`],
    );

    await createRecord('messageList', { id: listId, name: 'MCP tools list' });
    await createRecord('person', {
      id: personId,
      emails: { primaryEmail: `mcp-tools-${personId}@example.com` },
    });
    await createRecord('messageListMember', { id: memberId, listId, personId });
    await createRecord('messageCampaign', {
      id: campaignId,
      name: 'MCP tools campaign',
      subject: 'Monthly newsletter',
      bodyTemplate: SENDABLE_BODY_TEMPLATE,
      fromAddress: { primaryEmail: `campaigns@${domain}` },
      listId,
    });

    const suppressionResponse = await makeMetadataApiRequest({
      query: CREATE_MESSAGE_SUPPRESSION,
      variables: { input: { emailAddress: suppressedEmailAddress } },
    });

    expect(suppressionResponse.body.errors).toBeUndefined();
    suppressionId = suppressionResponse.body.data.createMessageSuppression.id;
  });

  afterAll(async () => {
    await makeMetadataApiRequest({
      query: DELETE_MESSAGE_SUPPRESSION,
      variables: { id: suppressionId },
    });
    await destroyRecord('messageCampaign', campaignId);
    await destroyRecord('messageListMember', memberId);
    await destroyRecord('person', personId);
    await destroyRecord('messageList', listId);
    await testDataSource.query(
      `DELETE FROM "core"."emailingDomain" WHERE "domain" = $1`,
      [domain],
    );
  });

  it('should preview the audience of a ready campaign', async () => {
    const output = await executeToolThroughMcp<{
      audience: { totalMembers: number; sendable: number };
      blockers: unknown[];
    }>({
      toolName: 'preview_campaign_send',
      toolArguments: { campaignId },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(output.success).toBe(true);
    expect(output.result).toMatchObject({
      audience: { totalMembers: 1, sendable: 1 },
      blockers: [],
    });
  });

  it('should refuse to send when the approved recipient count no longer matches', async () => {
    const output = await executeToolThroughMcp({
      toolName: 'send_campaign',
      toolArguments: { campaignId, expectedRecipientCount: 2 },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(output.success).toBe(false);
    expect(output.error).toContain('would now reach 1 recipient(s)');
    expect(await readCampaignStatus()).toBe('DRAFT');
  });

  it('should find a suppressed address', async () => {
    const output = await executeToolThroughMcp<{
      totalCount: number;
      suppressions: { emailAddress: string; reason: string }[];
    }>({
      toolName: 'find_campaign_suppressions',
      toolArguments: { searchTerm: suppressedEmailAddress },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(output.success).toBe(true);
    expect(output.result?.suppressions).toEqual([
      expect.objectContaining({
        emailAddress: suppressedEmailAddress,
        reason: 'UNSUBSCRIBE',
      }),
    ]);
  });

  it('should not let a member without the workspace settings permission send', async () => {
    const output = await executeToolThroughMcp({
      toolName: 'send_campaign',
      toolArguments: { campaignId, expectedRecipientCount: 2 },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(output).toMatchObject({
      success: false,
      message: 'Tool "send_campaign" not found',
    });
    expect(await readCampaignStatus()).toBe('DRAFT');
  });
});
