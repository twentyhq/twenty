import { CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { type GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { MessageCampaignStatisticsService } from 'src/modules/emailing/services/message-campaign-statistics.service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const CAMPAIGN_ID = '20202020-0000-0000-0000-000000000002';

describe('MessageCampaignStatisticsService', () => {
  let service: MessageCampaignStatisticsService;
  let messageCountMock: jest.Mock;
  let campaignUpdateMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    messageCountMock = jest.fn();
    campaignUpdateMock = jest.fn();

    const messageRepository = {
      count: messageCountMock,
    };
    const campaignRepository = {
      update: campaignUpdateMock,
    };

    const getRepositoryMock = jest
      .fn()
      .mockResolvedValueOnce(messageRepository)
      .mockResolvedValueOnce(campaignRepository);

    service = new MessageCampaignStatisticsService({
      getRepository: getRepositoryMock,
      executeInWorkspaceContext: jest
        .fn()
        .mockImplementation((fn: () => unknown) => fn()),
    } as unknown as GlobalWorkspaceOrmManager);
  });

  it('should update campaign counters with per-status message counts', async () => {
    const messageCountByDeliveryStatus: Record<string, number> = {
      [CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT]: 2,
      [CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED]: 1,
    };

    messageCountMock.mockImplementation(
      ({ where }: { where: { deliveryStatus: string } }) =>
        Promise.resolve(
          messageCountByDeliveryStatus[where.deliveryStatus] ?? 0,
        ),
    );

    await service.refreshCampaignCounts(WORKSPACE_ID, CAMPAIGN_ID);

    expect(messageCountMock).toHaveBeenCalledWith({
      where: {
        messageCampaignId: CAMPAIGN_ID,
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT,
      },
    });
    expect(campaignUpdateMock).toHaveBeenCalledWith(
      { id: CAMPAIGN_ID },
      {
        sentCount: 2,
        failedCount: 0,
        bouncedCount: 1,
        complainedCount: 0,
      },
    );
  });
});
