import { type DataSource } from 'typeorm';

import { ShahryarNotificationService } from 'src/modules/shahryar/services/shahryar-notification.service';
import { type ShahryarReportService } from 'src/modules/shahryar/services/shahryar-report.service';

type ShahryarQueryMock = jest.Mock<Promise<unknown>, [string, unknown[]?]>;

type ShahryarMobileDeviceTestRow = {
  id: string;
  deviceId: string;
  expoPushToken: string;
  enabledNotificationKinds: string;
  registeredById: string;
};

type ShahryarDeliveryTestRow = {
  id: string;
  notificationDeliveryId: string;
  notificationId: string;
  kind: 'missing-report' | 'missed-visit';
  severity: 'warning' | 'critical';
  supervisorId: string;
  supervisorName: string;
  marketId?: string | null;
  marketName?: string | null;
  deviceId: string;
  expoPushToken: string;
  title: string;
  body: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  attemptCount: number;
  lastAttemptAt?: string | null;
  failureReason?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';

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

const createDeviceRow = ({
  enabledNotificationKinds = 'missing-report,missed-visit',
}: {
  enabledNotificationKinds?: string;
} = {}): ShahryarMobileDeviceTestRow => ({
  id: 'device-record-1',
  deviceId: 'ios-device-1',
  expoPushToken: 'ExponentPushToken[test]',
  enabledNotificationKinds,
  registeredById: 'supervisor-1',
});

const createDeliveryRow = ({
  notificationDeliveryId = 'missing-report-supervisor-1-2026-06-01-device-record-1',
  status = 'PENDING',
}: {
  notificationDeliveryId?: string;
  status?: ShahryarDeliveryTestRow['status'];
} = {}): ShahryarDeliveryTestRow => ({
  id: 'delivery-row-1',
  notificationDeliveryId,
  notificationId: 'missing-report-supervisor-1-2026-06-01',
  kind: 'missing-report',
  severity: 'warning',
  supervisorId: 'supervisor-1',
  supervisorName: 'Karwan',
  deviceId: 'ios-device-1',
  expoPushToken: 'ExponentPushToken[test]',
  title: 'ڕاپۆرت نەهات',
  body: 'Karwan has not submitted the daily report',
  status,
  attemptCount: status === 'PENDING' ? 0 : 1,
  lastAttemptAt: status === 'PENDING' ? null : '2026-06-01T17:00:00.000Z',
  failureReason: status === 'FAILED' ? 'Expo push ticket failed' : null,
  createdAt: '2026-06-01T16:59:00.000Z',
  updatedAt: '2026-06-01T17:00:00.000Z',
});

const createQueryMock = ({
  deliveryRows = [],
  deviceRows = [createDeviceRow()],
}: {
  deliveryRows?: ShahryarDeliveryTestRow[];
  deviceRows?: ShahryarMobileDeviceTestRow[];
} = {}): ShahryarQueryMock =>
  jest.fn<Promise<unknown>, [string, unknown[]?]>(async (sql) => {
    if (sql.includes('"_shahryarMobileDevice"')) {
      return deviceRows;
    }

    if (
      sql.includes('"_shahryarNotificationDelivery"') &&
      sql.trimStart().startsWith('SELECT')
    ) {
      return deliveryRows;
    }

    return [];
  });

describe('ShahryarNotificationService', () => {
  it('should build and persist pending notification deliveries for registered supervisor devices', async () => {
    const query = createQueryMock();
    const service = new ShahryarNotificationService(
      createMockDataSource(query),
      createMockReportService(),
    );

    const deliveries = await service.getPendingDeliveries({
      workspaceId: WORKSPACE_ID,
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
        status: 'pending',
        attemptCount: 0,
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
        status: 'pending',
        attemptCount: 0,
      },
    ]);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('"_shahryarMobileDevice"'),
      [['supervisor-1']],
    );
    expect(
      query.mock.calls.filter((call) => call[0].includes('INSERT INTO')).length,
    ).toBe(2);
  });

  it('should skip already sent delivery rows for dedupe', async () => {
    const query = createQueryMock({
      deliveryRows: [createDeliveryRow({ status: 'SENT' })],
      deviceRows: [
        createDeviceRow({ enabledNotificationKinds: 'missing-report' }),
      ],
    });
    const service = new ShahryarNotificationService(
      createMockDataSource(query),
      createMockReportService(),
    );

    await expect(
      service.getPendingDeliveries({ workspaceId: WORKSPACE_ID }),
    ).resolves.toEqual([]);
    expect(
      query.mock.calls.some((call) => call[0].includes('INSERT INTO')),
    ).toBe(false);
  });

  it('should dispatch pending notification deliveries through Expo push API and mark sent rows', async () => {
    const query = createQueryMock({
      deviceRows: [
        createDeviceRow({ enabledNotificationKinds: 'missing-report' }),
      ],
    });
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
      workspaceId: WORKSPACE_ID,
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
    expect(
      query.mock.calls.some(
        (call) => call[0].includes('UPDATE') && call[1]?.[0] === 'SENT',
      ),
    ).toBe(true);
  });

  it('should report failed delivery ids and mark failed rows when Expo push dispatch fails', async () => {
    const query = createQueryMock({
      deviceRows: [
        createDeviceRow({ enabledNotificationKinds: 'missing-report' }),
      ],
    });
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
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toEqual({
      attemptedCount: 1,
      sentCount: 0,
      failedCount: 1,
      failedDeliveryIds: [
        'missing-report-supervisor-1-2026-06-01-device-record-1',
      ],
    });
    expect(
      query.mock.calls.some(
        (call) =>
          call[0].includes('UPDATE') &&
          call[1]?.[0] === 'FAILED' &&
          call[1]?.[2] === 'Expo push API returned an error',
      ),
    ).toBe(true);
  });

  it('should expose persisted delivery log rows with audit status', async () => {
    const query = createQueryMock({
      deliveryRows: [createDeliveryRow({ status: 'FAILED' })],
      deviceRows: [],
    });
    const service = new ShahryarNotificationService(
      createMockDataSource(query),
      createMockReportService(),
    );

    await expect(
      service.getDeliveryLog({
        status: 'failed',
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toEqual([
      expect.objectContaining({
        id: 'missing-report-supervisor-1-2026-06-01-device-record-1',
        status: 'failed',
        attemptCount: 1,
        lastAttemptAt: '2026-06-01T17:00:00.000Z',
        failureReason: 'Expo push ticket failed',
      }),
    ]);
    expect(query.mock.calls[query.mock.calls.length - 1]?.[1]).toEqual([
      'FAILED',
    ]);
  });
});
