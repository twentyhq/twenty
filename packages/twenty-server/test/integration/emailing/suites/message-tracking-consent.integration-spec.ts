import { MessageTrackingConsentDecision } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-decision.type';
import { MessageTrackingConsentSource } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-source.type';
import { MessageTrackingConsentService } from 'src/modules/emailing/services/message-tracking-consent.service';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const EMAIL_ADDRESS = 'tracking-consent-integration@example.com';

describe('MessageTrackingConsentService (integration)', () => {
  let service: MessageTrackingConsentService;

  beforeAll(() => {
    service = getAppProviderByClassName<MessageTrackingConsentService>(
      'MessageTrackingConsentService',
    );
  });

  beforeEach(async () => {
    await global.testDataSource.query(
      `DELETE FROM core."messageTrackingConsent" WHERE "workspaceId" = $1 AND "emailAddress" = $2`,
      [WORKSPACE_ID, EMAIL_ADDRESS],
    );
  });

  afterAll(async () => {
    await global.testDataSource.query(
      `DELETE FROM core."messageTrackingConsent" WHERE "workspaceId" = $1 AND "emailAddress" = $2`,
      [WORKSPACE_ID, EMAIL_ADDRESS],
    );
  });

  it('preserves a recipient refusal when a member later grants tracking', async () => {
    await service.recordDecision({
      workspaceId: WORKSPACE_ID,
      emailAddress: EMAIL_ADDRESS,
      decision: MessageTrackingConsentDecision.GRANTED,
      source: MessageTrackingConsentSource.WORKSPACE_MEMBER,
    });
    await service.recordDecision({
      workspaceId: WORKSPACE_ID,
      emailAddress: EMAIL_ADDRESS,
      decision: MessageTrackingConsentDecision.DENIED,
      source: MessageTrackingConsentSource.PREFERENCES_PAGE,
    });

    await expect(
      service.recordDecision({
        workspaceId: WORKSPACE_ID,
        emailAddress: EMAIL_ADDRESS,
        decision: MessageTrackingConsentDecision.GRANTED,
        source: MessageTrackingConsentSource.WORKSPACE_MEMBER,
      }),
    ).rejects.toThrow('A recipient opted out of tracking themselves');

    await expect(
      service.findConsent({
        workspaceId: WORKSPACE_ID,
        emailAddress: EMAIL_ADDRESS,
      }),
    ).resolves.toMatchObject({
      decision: MessageTrackingConsentDecision.DENIED,
      source: MessageTrackingConsentSource.PREFERENCES_PAGE,
    });
  });

  it('keeps recipient ownership when a member repeats the denial', async () => {
    await service.recordDecision({
      workspaceId: WORKSPACE_ID,
      emailAddress: EMAIL_ADDRESS,
      decision: MessageTrackingConsentDecision.DENIED,
      source: MessageTrackingConsentSource.PREFERENCES_PAGE,
    });
    await service.recordDecision({
      workspaceId: WORKSPACE_ID,
      emailAddress: EMAIL_ADDRESS,
      decision: MessageTrackingConsentDecision.DENIED,
      source: MessageTrackingConsentSource.WORKSPACE_MEMBER,
    });

    await expect(
      service.findConsent({
        workspaceId: WORKSPACE_ID,
        emailAddress: EMAIL_ADDRESS,
      }),
    ).resolves.toMatchObject({
      decision: MessageTrackingConsentDecision.DENIED,
      source: MessageTrackingConsentSource.PREFERENCES_PAGE,
    });
  });
});
