import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';

import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CampaignEngagementEventService } from 'src/modules/emailing/services/campaign-engagement-event.service';
import { CampaignEngagementRecordingService } from 'src/modules/emailing/services/campaign-engagement-recording.service';
import { type CampaignEngagementObservation } from 'src/modules/emailing/types/campaign-engagement-observation.type';

const OBSERVATION: CampaignEngagementObservation = {
  eventId: 'b55db0be-cd10-4802-b332-0cb3e81a02c8',
  occurredAt: '2026-09-23T12:00:00.000Z',
  deliveryId: '7b1b78df-f57c-4367-88ba-31b41e38ab91',
  shortLinkId: 'e589543a-287d-4a83-ae31-55f9ef6c1cb3',
  userAgent: 'Mozilla/5.0',
};

describe('CampaignEngagementRecordingService', () => {
  const findDelivery = jest.fn();
  const findWorkspace = jest.fn();
  const insertClickOrThrow = jest.fn();
  let service: CampaignEngagementRecordingService;

  beforeEach(async () => {
    jest.clearAllMocks();
    findDelivery.mockResolvedValue({
      id: OBSERVATION.deliveryId,
      workspaceId: 'workspace-from-delivery',
      campaignId: 'campaign-from-delivery',
    });
    findWorkspace.mockResolvedValue({ isCampaignClickTrackingEnabled: true });

    const module = await Test.createTestingModule({
      providers: [
        CampaignEngagementRecordingService,
        {
          provide: getRepositoryToken(CampaignDeliveryEntity),
          useValue: { findOne: findDelivery },
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: { findOneBy: findWorkspace },
        },
        {
          provide: CampaignEngagementEventService,
          useValue: { insertClickOrThrow },
        },
      ],
    }).compile();

    service = module.get(CampaignEngagementRecordingService);
  });

  it('does not record when the delivery is missing', async () => {
    findDelivery.mockResolvedValue(null);

    await service.record(OBSERVATION);

    expect(findWorkspace).not.toHaveBeenCalled();
    expect(insertClickOrThrow).not.toHaveBeenCalled();
  });

  it('does not record when workspace tracking is disabled', async () => {
    findWorkspace.mockResolvedValue({ isCampaignClickTrackingEnabled: false });

    await service.record(OBSERVATION);

    expect(insertClickOrThrow).not.toHaveBeenCalled();
  });

  it('takes workspace and campaign IDs from the delivery', async () => {
    await service.record(OBSERVATION);

    expect(findWorkspace).toHaveBeenCalledWith({
      id: 'workspace-from-delivery',
    });
    expect(insertClickOrThrow).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 'workspace-from-delivery',
        messageCampaignId: 'campaign-from-delivery',
        eventId: OBSERVATION.eventId,
        deliveryId: OBSERVATION.deliveryId,
        shortLinkId: OBSERVATION.shortLinkId,
      }),
    );
  });

  it('keeps the same event ID when a worker retries the observation', async () => {
    await service.record(OBSERVATION);
    await service.record(OBSERVATION);

    expect(insertClickOrThrow).toHaveBeenCalledTimes(2);
    expect(insertClickOrThrow.mock.calls[0][0].eventId).toBe(
      OBSERVATION.eventId,
    );
    expect(insertClickOrThrow.mock.calls[1][0].eventId).toBe(
      OBSERVATION.eventId,
    );
  });
});
