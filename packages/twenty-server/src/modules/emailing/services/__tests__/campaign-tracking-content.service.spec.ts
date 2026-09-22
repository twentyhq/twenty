import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';

import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { CampaignTrackingTokenService } from 'src/engine/core-modules/emailing-domain/services/campaign-tracking-token.service';
import { ShortLinkService } from 'src/engine/core-modules/short-link/services/short-link.service';
import { hashShortLink } from 'src/engine/core-modules/short-link/utils/hash-short-link.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { CampaignEngagementEventService } from 'src/modules/emailing/services/campaign-engagement-event.service';
import { CampaignTrackingContentService } from 'src/modules/emailing/services/campaign-tracking-content.service';
import { MessageTrackingConsentService } from 'src/modules/emailing/services/message-tracking-consent.service';

const DESTINATION_URL = 'https://example.com/path';
const SHORT_LINK_ID = 'd0b045ba-2799-4dcb-8d9c-7f4d9674c4ee';

describe('CampaignTrackingContentService', () => {
  const registerLinks = jest.fn();
  const findDeniedEmailAddresses = jest.fn();
  let service: CampaignTrackingContentService;

  beforeEach(async () => {
    jest.clearAllMocks();
    registerLinks.mockResolvedValue(
      new Map([
        [
          hashShortLink({
            authoredTemplateUrl: DESTINATION_URL,
            resolvedDestinationUrl: DESTINATION_URL,
          }),
          SHORT_LINK_ID,
        ],
      ]),
    );
    findDeniedEmailAddresses.mockResolvedValue(new Set(['deny@example.com']));

    const module = await Test.createTestingModule({
      providers: [
        CampaignTrackingContentService,
        {
          provide: getWorkspaceScopedRepositoryToken(EmailingDomainEntity),
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              unsubscribeHostname: 'track.example.com',
            }),
          },
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: {
            findOneBy: jest.fn().mockResolvedValue({
              isCampaignClickTrackingEnabled: true,
            }),
          },
        },
        { provide: ShortLinkService, useValue: { registerLinks } },
        {
          provide: CampaignTrackingTokenService,
          useValue: { sign: jest.fn().mockReturnValue('signed-token') },
        },
        { provide: TwentyConfigService, useValue: { get: jest.fn() } },
        {
          provide: CampaignEngagementEventService,
          useValue: { isAvailable: jest.fn().mockReturnValue(true) },
        },
        {
          provide: MessageTrackingConsentService,
          useValue: { findDeniedEmailAddresses },
        },
      ],
    }).compile();

    service = module.get(CampaignTrackingContentService);
  });

  it('uses original URLs for opted-out recipients and tracked URLs for others', async () => {
    const batch = await service.prepareBatch({
      workspaceId: 'workspace-id',
      emailingDomainId: 'domain-id',
      template: {
        subject: 'Hello',
        html: `<a href="${DESTINATION_URL}">Open</a>`,
        text: DESTINATION_URL,
      },
      plainTextSourceHtml: `<a href="${DESTINATION_URL}">Open</a>`,
      variableNames: [],
      recipients: [
        {
          deliveryId: 'denied-delivery',
          email: 'deny@example.com',
          replacements: {},
        },
        {
          deliveryId: 'allowed-delivery',
          email: 'allow@example.com',
          replacements: {},
        },
      ],
    });

    expect(batch.replacementsByDeliveryId.get('denied-delivery')).toMatchObject(
      {
        c_h_0: DESTINATION_URL,
        c_t_0: DESTINATION_URL,
      },
    );
    expect(
      batch.replacementsByDeliveryId.get('allowed-delivery'),
    ).toMatchObject({
      c_h_0: 'https://track.example.com/emailing/c/signed-token',
    });
  });
});
