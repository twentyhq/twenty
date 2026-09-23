import { gql } from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { MessageTrackingConsentDecision } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-decision.type';
import { MessageTrackingConsentSource } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-source.type';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { MessageTrackingConsentService } from 'src/modules/emailing/services/message-tracking-consent.service';

const MESSAGE_TRACKING_OPT_OUTS = gql`
  query MessageTrackingOptOuts($input: FindMessageTrackingOptOutsInput!) {
    messageTrackingOptOuts(input: $input) {
      totalCount
      records {
        emailAddress
        source
      }
    }
  }
`;

describe('messageTrackingConsent (integration)', () => {
  let messageTrackingConsentService: MessageTrackingConsentService;
  const recordedEmailAddresses: string[] = [];

  beforeAll(async () => {
    messageTrackingConsentService =
      getAppProviderByClassName<MessageTrackingConsentService>(
        'MessageTrackingConsentService',
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
    for (const emailAddress of recordedEmailAddresses) {
      await testDataSource
        .query(
          'DELETE FROM core."messageTrackingConsent" WHERE "workspaceId" = $1 AND "emailAddress" = $2',
          [SEED_APPLE_WORKSPACE_ID, emailAddress],
        )
        .catch(() => {});
    }
    recordedEmailAddresses.length = 0;
  });

  const recordOnPreferencesPage = async ({
    emailAddress,
    decision,
  }: {
    emailAddress: string;
    decision: MessageTrackingConsentDecision;
  }) => {
    recordedEmailAddresses.push(emailAddress.trim().toLowerCase());

    await messageTrackingConsentService.recordDecision({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      emailAddress,
      decision,
      source: MessageTrackingConsentSource.PREFERENCES_PAGE,
    });
  };

  const listOptOuts = async (searchTerm: string) => {
    const response = await makeMetadataAPIRequest({
      query: MESSAGE_TRACKING_OPT_OUTS,
      variables: { input: { searchTerm, limit: 30, offset: 0 } },
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.messageTrackingOptOuts;
  };

  it('should keep a recipient who opted out off the tracked list and show them in settings', async () => {
    const emailAddress = `opted-out-${v4()}@example.com`;

    await recordOnPreferencesPage({
      emailAddress,
      decision: MessageTrackingConsentDecision.DENIED,
    });

    await expect(
      messageTrackingConsentService.findDeniedEmailAddresses({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        emailAddresses: [emailAddress.toUpperCase()],
      }),
    ).resolves.toEqual(new Set([emailAddress]));

    expect(await listOptOuts(emailAddress)).toEqual({
      totalCount: 1,
      records: [{ emailAddress, source: 'PREFERENCES_PAGE' }],
    });
  });

  it('should let a recipient opt back in without leaving a second row behind', async () => {
    const emailAddress = `opted-back-in-${v4()}@example.com`;

    await recordOnPreferencesPage({
      emailAddress,
      decision: MessageTrackingConsentDecision.DENIED,
    });
    await recordOnPreferencesPage({
      emailAddress,
      decision: MessageTrackingConsentDecision.GRANTED,
    });

    await expect(
      messageTrackingConsentService.findDeniedEmailAddresses({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        emailAddresses: [emailAddress],
      }),
    ).resolves.toEqual(new Set());

    const consentRows = await testDataSource.query(
      'SELECT "decision" FROM core."messageTrackingConsent" WHERE "workspaceId" = $1 AND "emailAddress" = $2',
      [SEED_APPLE_WORKSPACE_ID, emailAddress],
    );

    expect(consentRows).toEqual([{ decision: 'GRANTED' }]);
  });

  it('should lower-case the address so sends match it', async () => {
    const emailAddress = `Mixed-${v4()}@Example.com`;

    await recordOnPreferencesPage({
      emailAddress: ` ${emailAddress} `,
      decision: MessageTrackingConsentDecision.DENIED,
    });

    const optOuts = await listOptOuts(emailAddress.toLowerCase());

    expect(optOuts.records).toEqual([
      { emailAddress: emailAddress.toLowerCase(), source: 'PREFERENCES_PAGE' },
    ]);
  });
});
