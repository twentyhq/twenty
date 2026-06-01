import { type DataSource } from 'typeorm';

import { ShahryarNotificationService } from 'src/modules/shahryar/services/shahryar-notification.service';
import { type ShahryarReportService } from 'src/modules/shahryar/services/shahryar-report.service';

type ShahryarQueryMock = jest.Mock<Promise<unknown>, [string, unknown[]?]>;

const createMockDataSource = (query: ShahryarQueryMock) =>
  ({
    query,
  }) as unknown as DataSource;

const createMockReportService = () =>
  ({
    getSummary: jest.fn().mockResolvedValue({
      referenceDate: '2026-06-01',
      activeMarketCount: 1,
      activeSupervisorCount: 1,
      totalVisits: 0,
      totalSalesCartons: 0,
      totalRequestedCartons: 0,
      totalPaidAmount: 0,
      totalPenaltyAmount: 0,
      totalAbsences: 0,
      backupStatus: {
        label: 'Healthy',
        lastRunLabel: '2026-06-01 02:15 UTC',
      },
      rows: [],
      notifications: [
        {
          id: 'missing-report-supervisor-1-2026-06-01',
          kind: 'missing-report',
          severity: 'warning',
          supervisorId: 'supervisor-1',
          supervisorName: 'Karwan',
          message: 'Karwan has not submitted the daily report',
        },
        {
          id: 'missed-visit-market-1-2026-06-01',
          kind: 'missed-visit',
          severity: 'critical',
          supervisorId: 'supervisor-1',
          supervisorName: 'Karwan',
          marketId: 'market-1',
          marketName: 'Center Market',
          message: 'Center Market has no recorded visit',
        },
      ],
    }),
  }) as unknown as ShahryarReportService;

describe('ShahryarNotificationService', () => {
  it('should build pending notification deliveries for registered supervisor devices', async () => {
    const query = jest
      .fn<Promise<unknown>, [string, unknown[]?]>()
      .mockResolvedValue([
        {
          id: 'device-record-1',
          deviceId: 'ios-device-1',
          expoPushToken: 'ExponentPushToken[test]',
          enabledNotificationKinds: 'missing-report,missed-visit',
          registeredById: 'supervisor-1',
        },
      ]);
    const service = new ShahryarNotificationService(
      createMockDataSource(query),
      createMockReportService(),
    );

    const deliveries = await service.getPendingDeliveries({
      workspaceId: '20202020-0000-4000-8000-000000000001',
    });

    expect(deliveries).toEqual([
      {
        id: 'missing-report-supervisor-1-2026-06-01-device-record-1',
        notificationId: 'missing-report-supervisor-1-2026-06-01',
        kind: 'missing-report',
        severity: 'warning',
        supervisorId: 'supervisor-1',
        supervisorName: 'Karwan',
        deviceId: 'ios-device-1',
        expoPushToken: 'ExponentPushToken[test]',
        title: 'ڕاپۆرت نەهات',
        body: 'Karwan has not submitted the daily report',
      },
      {
        id: 'missed-visit-market-1-2026-06-01-device-record-1',
        notificationId: 'missed-visit-market-1-2026-06-01',
        kind: 'missed-visit',
        severity: 'critical',
        supervisorId: 'supervisor-1',
        supervisorName: 'Karwan',
        marketId: 'market-1',
        marketName: 'Center Market',
        deviceId: 'ios-device-1',
        expoPushToken: 'ExponentPushToken[test]',
        title: 'سەردان نەکرا',
        body: 'Center Market has no recorded visit',
      },
    ]);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('"_shahryarMobileDevice"'),
      [['supervisor-1']],
    );
  });

  it('should dispatch pending notification deliveries through Expo push API', async () => {
    const query = jest
      .fn<Promise<unknown>, [string, unknown[]?]>()
      .mockResolvedValue([
        {
          id: 'device-record-1',
          deviceId: 'ios-device-1',
          expoPushToken: 'ExponentPushToken[test]',
          enabledNotificationKinds: 'missing-report',
          registeredById: 'supervisor-1',
        },
      ]);
    const fetcher = jest
      .fn<Promise<Response>, Parameters<typeof fetch>>()
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            data: [
              {
                status: 'ok',
              },
            ],
          }),
          { status: 200 },
        ),
      );
    const service = new ShahryarNotificationService(
      createMockDataSource(query),
      createMockReportService(),
    );

    const result = await service.dispatchPendingNotifications({
      fetcher,
      workspaceId: '20202020-0000-4000-8000-000000000001',
    });

    expect(result).toEqual({
      attemptedCount: 1,
      sentCount: 1,
      failedCount: 0,
      failedDeliveryIds: [],
    });
    expect(fetcher).toHaveBeenCalledWith(
      'https://exp.host/--/api/v2/push/send',
      expect.objectContaining({
        method: 'POST',
      }),
    );
    expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string)).toEqual([
      expect.objectContaining({
        to: 'ExponentPushToken[test]',
        title: 'ڕاپۆرت نەهات',
      }),
    ]);
  });

  it('should report failed delivery ids when Expo push dispatch fails', async () => {
    const query = jest
      .fn<Promise<unknown>, [string, unknown[]?]>()
      .mockResolvedValue([
        {
          id: 'device-record-1',
          deviceId: 'ios-device-1',
          expoPushToken: 'ExponentPushToken[test]',
          enabledNotificationKinds: 'missing-report',
          registeredById: 'supervisor-1',
        },
      ]);
    const fetcher = jest
      .fn<Promise<Response>, Parameters<typeof fetch>>()
      .mockResolvedValue(new Response('{}', { status: 500 }));
    const service = new ShahryarNotificationService(
      createMockDataSource(query),
      createMockReportService(),
    );

    await expect(
      service.dispatchPendingNotifications({
        fetcher,
        workspaceId: '20202020-0000-4000-8000-000000000001',
      }),
    ).resolves.toEqual({
      attemptedCount: 1,
      sentCount: 0,
      failedCount: 1,
      failedDeliveryIds: [
        'missing-report-supervisor-1-2026-06-01-device-record-1',
      ],
    });
  });
});
