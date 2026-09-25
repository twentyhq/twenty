import { gql } from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { isSuppressionBlockingSend } from 'src/engine/core-modules/emailing-domain/utils/is-suppression-blocking-send.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { MessageSuppressionService } from 'src/modules/emailing/services/message-suppression.service';

const MESSAGE_SUPPRESSIONS = gql`
  query MessageSuppressions($input: FindMessageSuppressionsInput!) {
    messageSuppressions(input: $input) {
      totalCount
      records {
        emailAddress
        reason
      }
    }
  }
`;

const SUPPRESSION_TABLE = `"${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"."messageSuppression"`;

describe('tracking opt-out as a suppression (integration)', () => {
  let messageSuppressionService: MessageSuppressionService;
  const usedEmailAddresses: string[] = [];

  beforeAll(async () => {
    messageSuppressionService =
      getAppProviderByClassName<MessageSuppressionService>(
        'MessageSuppressionService',
      );

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED,
      value: true,
      expectToFail: false,
    });
  });

  afterAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED,
      value: false,
      expectToFail: false,
    });
  });

  afterEach(async () => {
    for (const emailAddress of usedEmailAddresses) {
      await testDataSource
        .query(`DELETE FROM ${SUPPRESSION_TABLE} WHERE "emailAddress" = $1`, [
          emailAddress,
        ])
        .catch(() => {});
    }
    usedEmailAddresses.length = 0;
  });

  const newEmailAddress = (prefix: string) => {
    const emailAddress = `${prefix}-${v4()}@example.com`;

    usedEmailAddresses.push(emailAddress);

    return emailAddress;
  };

  it('should keep the address off the tracked list, show it in settings, and still let mail through', async () => {
    const emailAddress = newEmailAddress('opted-out');

    await messageSuppressionService.setTrackingOptOut({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      emailAddress: emailAddress.toUpperCase(),
      isOptedOut: true,
    });

    const trackingOptedOutEmailAddresses =
      await messageSuppressionService.findTrackingOptedOutEmailAddresses({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        emailAddresses: [emailAddress],
      });

    expect([...trackingOptedOutEmailAddresses]).toEqual([emailAddress]);

    const [suppression] =
      await messageSuppressionService.findApplicableSuppressions({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        emailAddresses: [emailAddress],
      });

    expect(suppression.reason).toBe(MessageSuppressionReason.TRACKING);
    expect(
      isSuppressionBlockingSend({ sendKind: 'MARKETING', suppression }),
    ).toBe(false);

    const listResponse = await makeMetadataApiRequest({
      query: MESSAGE_SUPPRESSIONS,
      variables: {
        input: { searchTerm: emailAddress, limit: 30, offset: 0 },
      },
    });

    expect(listResponse.body.data.messageSuppressions).toEqual({
      totalCount: 1,
      records: [{ emailAddress, reason: 'TRACKING' }],
    });
  });

  it('should let a recipient opt back in and leave nothing behind', async () => {
    const emailAddress = newEmailAddress('opted-back-in');

    await messageSuppressionService.setTrackingOptOut({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      emailAddress,
      isOptedOut: true,
    });
    await messageSuppressionService.setTrackingOptOut({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      emailAddress,
      isOptedOut: false,
    });

    await expect(
      messageSuppressionService.findApplicableSuppressions({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        emailAddresses: [emailAddress],
      }),
    ).resolves.toEqual([]);
  });

  it('should keep a tracking opt-out next to a global unsubscribe of the same address', async () => {
    const emailAddress = newEmailAddress('both');

    await messageSuppressionService.setTrackingOptOut({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      emailAddress,
      isOptedOut: true,
    });
    await messageSuppressionService.unsubscribeFromEverything({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      emailAddress,
    });

    const suppressions =
      await messageSuppressionService.findApplicableSuppressions({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        emailAddresses: [emailAddress],
      });

    expect(suppressions.map(({ reason }) => reason).sort()).toEqual([
      MessageSuppressionReason.TRACKING,
      MessageSuppressionReason.UNSUBSCRIBE,
    ]);
  });
});
