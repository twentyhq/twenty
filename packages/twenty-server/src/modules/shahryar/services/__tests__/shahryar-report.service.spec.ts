import { type DataSource } from 'typeorm';

import { ShahryarReportService } from 'src/modules/shahryar/services/shahryar-report.service';

type ShahryarQueryMock = jest.Mock<Promise<unknown>, [string, unknown[]?]>;

const createMockDataSource = (query: ShahryarQueryMock) =>
  ({
    query,
  }) as unknown as DataSource;

describe('ShahryarReportService', () => {
  it('should build report summaries from Shahryar workspace tables', async () => {
    const query = jest
      .fn<Promise<unknown>, [string, unknown[]?]>()
      .mockImplementation(async (sql) => {
        if (sql.includes('"workspaceMember"')) {
          return [
            {
              id: 'supervisor-1',
              nameFirstName: 'Karwan',
              nameLastName: 'Shahryar',
            },
          ];
        }

        if (sql.includes('"_shahryarMarket"')) {
          return [
            {
              id: 'market-1',
              name: 'Center Market',
              assignedSupervisorId: 'supervisor-1',
              isActiveMarket: true,
            },
          ];
        }

        if (sql.includes('"_shahryarSupervisorVisit"')) {
          return [
            {
              id: 'visit-1',
              marketId: 'market-1',
              supervisorId: 'supervisor-1',
              checkInAt: '2026-06-01T09:00:00.000Z',
              soldCartons: 12,
              requestedCartons: 4,
              issue: 'No blocker',
              decisionMaker: 'Store owner',
              requestDetails: 'Four cartons requested',
              report: 'Visit completed',
            },
          ];
        }

        if (sql.includes('"_shahryarWorkingTime"')) {
          return [
            {
              id: 'working-time-1',
              supervisorId: 'supervisor-1',
              workDate: '2026-06-01T00:00:00.000Z',
              checkInAt: '2026-06-01T08:00:00.000Z',
              checkOutAt: '2026-06-01T16:00:00.000Z',
              gpsLocation: '36.191, 44.009',
              totalMinutes: 480,
              status: 'PRESENT',
            },
          ];
        }

        if (sql.includes('"_shahryarPayment"')) {
          return [
            {
              id: 'payment-1',
              marketId: 'market-1',
              collectedById: 'supervisor-1',
              paidAt: '2026-06-01T10:00:00.000Z',
              dueDate: '2026-06-01T00:00:00.000Z',
              amount: 250000,
            },
          ];
        }

        if (sql.includes('"_shahryarSupervisorPenalty"')) {
          return [];
        }

        if (sql.includes('"_shahryarAbsence"')) {
          return [];
        }

        return [];
      });
    const service = new ShahryarReportService(createMockDataSource(query));

    const summary = await service.getSummary(
      '20202020-0000-4000-8000-000000000001',
      { referenceDate: '2026-06-01' },
    );

    expect(summary.activeMarketCount).toBe(1);
    expect(summary.activeSupervisorCount).toBe(1);
    expect(summary.totalVisits).toBe(1);
    expect(summary.totalSalesCartons).toBe(12);
    expect(summary.totalPaidAmount).toBe(250000);
    expect(summary.notifications).toHaveLength(0);
    expect(summary.analytics.bestMarkets).toEqual([
      expect.objectContaining({
        id: 'market-1',
        label: 'Center Market',
        value: 12,
      }),
    ]);
    expect(query).toHaveBeenCalledTimes(7);
  });

  it('should display stored photo counts in Shahryar record sections', async () => {
    const query = jest
      .fn<Promise<unknown>, [string, unknown[]?]>()
      .mockImplementation(async (sql) => {
        if (sql.includes('"workspaceMember"')) {
          return [
            {
              id: 'supervisor-1',
              nameFirstName: 'Karwan',
              nameLastName: 'Shahryar',
            },
          ];
        }

        if (sql.includes('"_shahryarMarket"')) {
          return [
            {
              id: 'market-1',
              name: 'Center Market',
              assignedSupervisorId: 'supervisor-1',
              isActiveMarket: true,
              shopPhotos: [
                {
                  fileId: 'photo-1',
                  label: 'shop.jpg',
                },
              ],
            },
          ];
        }

        if (sql.includes('"_shahryarSupervisorVisit"')) {
          return [
            {
              id: 'visit-1',
              marketId: 'market-1',
              supervisorId: 'supervisor-1',
              checkInAt: '2026-06-01T09:00:00.000Z',
              photos: JSON.stringify([
                {
                  fileId: 'photo-2',
                  label: 'visit-1.jpg',
                },
                {
                  fileId: 'photo-3',
                  label: 'visit-2.jpg',
                },
              ]),
              soldCartons: 12,
              requestedCartons: 4,
              issue: 'No blocker',
              decisionMaker: 'Store owner',
              requestDetails: 'Four cartons requested',
              report: 'Visit completed',
            },
          ];
        }

        if (sql.includes('"_shahryarWorkingTime"')) {
          return [];
        }

        if (sql.includes('"_shahryarPayment"')) {
          return [];
        }

        if (sql.includes('"_shahryarSupervisorPenalty"')) {
          return [];
        }

        if (sql.includes('"_shahryarAbsence"')) {
          return [];
        }

        return [];
      });
    const service = new ShahryarReportService(createMockDataSource(query));

    const sections = await service.getRecordSections(
      '20202020-0000-4000-8000-000000000001',
      { referenceDate: '2026-06-01' },
    );

    expect(sections[0].rows[0][5]).toBe('1 وێنە');
    expect(sections[1].rows[0][4]).toBe('2 وێنە');
  });

  it('should generate deterministic missed visit and missing report notifications', async () => {
    const query = jest
      .fn<Promise<unknown>, [string, unknown[]?]>()
      .mockImplementation(async (sql) => {
        if (sql.includes('"workspaceMember"')) {
          return [
            {
              id: 'supervisor-1',
              nameFirstName: 'Karwan',
              nameLastName: 'Shahryar',
            },
            {
              id: 'supervisor-2',
              nameFirstName: 'Halo',
              nameLastName: 'Shahryar',
            },
          ];
        }

        if (sql.includes('"_shahryarMarket"')) {
          return [
            {
              id: 'market-1',
              name: 'Center Market',
              assignedSupervisorId: 'supervisor-1',
              isActiveMarket: true,
            },
            {
              id: 'market-2',
              name: 'North Market',
              assignedSupervisorId: 'supervisor-2',
              isActiveMarket: true,
            },
          ];
        }

        if (sql.includes('"_shahryarSupervisorVisit"')) {
          return [
            {
              id: 'visit-1',
              marketId: 'market-1',
              supervisorId: 'supervisor-1',
              checkInAt: '2026-06-01T09:00:00.000Z',
              soldCartons: 12,
              requestedCartons: 4,
              issue: 'No blocker',
              decisionMaker: 'Store owner',
              requestDetails: 'Four cartons requested',
              report: '',
            },
          ];
        }

        if (sql.includes('"_shahryarWorkingTime"')) {
          return [
            {
              id: 'working-time-1',
              supervisorId: 'supervisor-1',
              workDate: '2026-06-01T00:00:00.000Z',
              checkInAt: '2026-06-01T08:00:00.000Z',
              checkOutAt: '2026-06-01T16:00:00.000Z',
              totalMinutes: 480,
              status: 'PRESENT',
            },
          ];
        }

        if (sql.includes('"_shahryarPayment"')) {
          return [];
        }

        if (sql.includes('"_shahryarSupervisorPenalty"')) {
          return [];
        }

        if (sql.includes('"_shahryarAbsence"')) {
          return [];
        }

        return [];
      });
    const service = new ShahryarReportService(createMockDataSource(query));

    const summary = await service.getSummary(
      '20202020-0000-4000-8000-000000000001',
      { referenceDate: '2026-06-01' },
    );

    expect(summary.referenceDate).toBe('2026-06-01');
    expect(summary.notifications).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'missing-report-supervisor-1-2026-06-01',
          kind: 'missing-report',
          supervisorId: 'supervisor-1',
        }),
        expect.objectContaining({
          id: 'missed-visit-market-2-2026-06-01',
          kind: 'missed-visit',
          marketId: 'market-2',
          supervisorId: 'supervisor-2',
        }),
      ]),
    );
  });

  it('should scope report summaries to the authorized supervisor', async () => {
    const query = jest
      .fn<Promise<unknown>, [string, unknown[]?]>()
      .mockImplementation(async (sql) => {
        if (sql.includes('"workspaceMember"')) {
          return [
            {
              id: 'supervisor-1',
              nameFirstName: 'Karwan',
              nameLastName: 'Shahryar',
            },
            {
              id: 'supervisor-2',
              nameFirstName: 'Halo',
              nameLastName: 'Shahryar',
            },
          ];
        }

        if (sql.includes('"_shahryarMarket"')) {
          return [
            {
              id: 'market-1',
              name: 'Center Market',
              assignedSupervisorId: 'supervisor-1',
              isActiveMarket: true,
            },
            {
              id: 'market-2',
              name: 'North Market',
              assignedSupervisorId: 'supervisor-2',
              isActiveMarket: true,
            },
          ];
        }

        if (sql.includes('"_shahryarSupervisorVisit"')) {
          return [
            {
              id: 'visit-1',
              marketId: 'market-1',
              supervisorId: 'supervisor-1',
              checkInAt: '2026-06-01T09:00:00.000Z',
              soldCartons: 12,
              requestedCartons: 4,
              issue: 'No blocker',
              decisionMaker: 'Store owner',
              requestDetails: 'Four cartons requested',
              report: 'Visit completed',
            },
            {
              id: 'visit-2',
              marketId: 'market-2',
              supervisorId: 'supervisor-2',
              checkInAt: '2026-06-01T10:00:00.000Z',
              soldCartons: 20,
              requestedCartons: 6,
              issue: 'No blocker',
              decisionMaker: 'Store owner',
              requestDetails: 'Six cartons requested',
              report: 'Visit completed',
            },
          ];
        }

        if (sql.includes('"_shahryarWorkingTime"')) {
          return [
            {
              id: 'working-time-1',
              supervisorId: 'supervisor-1',
              workDate: '2026-06-01T00:00:00.000Z',
              checkInAt: '2026-06-01T08:00:00.000Z',
              checkOutAt: '2026-06-01T16:00:00.000Z',
              totalMinutes: 480,
              status: 'PRESENT',
            },
            {
              id: 'working-time-2',
              supervisorId: 'supervisor-2',
              workDate: '2026-06-01T00:00:00.000Z',
              checkInAt: '2026-06-01T08:30:00.000Z',
              checkOutAt: '2026-06-01T15:30:00.000Z',
              totalMinutes: 420,
              status: 'PRESENT',
            },
          ];
        }

        if (sql.includes('"_shahryarPayment"')) {
          return [
            {
              id: 'payment-1',
              marketId: 'market-1',
              collectedById: 'supervisor-1',
              paidAt: '2026-06-01T10:00:00.000Z',
              amount: 250000,
            },
            {
              id: 'payment-2',
              marketId: 'market-2',
              collectedById: 'supervisor-2',
              paidAt: '2026-06-01T11:00:00.000Z',
              amount: 500000,
            },
          ];
        }

        if (sql.includes('"_shahryarSupervisorPenalty"')) {
          return [
            {
              id: 'penalty-1',
              supervisorId: 'supervisor-2',
              penaltyDate: '2026-06-01T12:00:00.000Z',
              amount: 10000,
              reason: 'Late report',
            },
          ];
        }

        if (sql.includes('"_shahryarAbsence"')) {
          return [
            {
              id: 'absence-1',
              supervisorId: 'supervisor-1',
              absenceDate: '2026-06-01T00:00:00.000Z',
              reason: 'ABSENT',
            },
          ];
        }

        return [];
      });
    const service = new ShahryarReportService(createMockDataSource(query));

    const summary = await service.getSummary(
      '20202020-0000-4000-8000-000000000001',
      { authorizedSupervisorId: 'supervisor-1', referenceDate: '2026-06-01' },
    );

    expect(summary.activeMarketCount).toBe(1);
    expect(summary.activeSupervisorCount).toBe(1);
    expect(summary.totalVisits).toBe(1);
    expect(summary.totalSalesCartons).toBe(12);
    expect(summary.totalPaidAmount).toBe(250000);
    expect(summary.totalPenaltyAmount).toBe(0);
    expect(summary.totalAbsences).toBe(1);
  });

  it('should expose the seed report source when no workspace is provided', async () => {
    const query = jest.fn<Promise<unknown>, [string, unknown[]?]>();
    const service = new ShahryarReportService(createMockDataSource(query));

    const summary = await service.getSummary(undefined, {
      referenceDate: '2026-06-01',
    });

    expect(summary.activeMarketCount).toBeGreaterThan(0);
    expect(summary.totalVisits).toBeGreaterThan(0);
    expect(query).not.toHaveBeenCalled();
  });

  it('should surface workspace table failures instead of falling back to seeds', async () => {
    const query = jest
      .fn<Promise<unknown>, [string, unknown[]?]>()
      .mockRejectedValue(new Error('workspace tables unavailable'));
    const service = new ShahryarReportService(createMockDataSource(query));

    await expect(
      service.getSummary('20202020-0000-4000-8000-000000000001'),
    ).rejects.toThrow('workspace tables unavailable');
  });

  it('should expose record section rows from Shahryar workspace tables', async () => {
    const query = jest
      .fn<Promise<unknown>, [string, unknown[]?]>()
      .mockImplementation(async (sql) => {
        if (sql.includes('"workspaceMember"')) {
          return [
            {
              id: 'supervisor-1',
              nameFirstName: 'Karwan',
              nameLastName: 'Shahryar',
            },
          ];
        }

        if (sql.includes('"_shahryarMarket"')) {
          return [
            {
              id: 'market-1',
              name: 'Center Market',
              ownerName: 'Store Owner',
              phoneNumber: '0750 000 0001',
              marketAddress: 'Erbil',
              district: 'Erbil',
              gpsLocation: '36.191, 44.009',
              paymentStatus: 'PAID',
              balanceAmount: 0,
              notes: 'Weekly follow-up',
              assignedSupervisorId: 'supervisor-1',
              isActiveMarket: true,
            },
          ];
        }

        if (sql.includes('"_shahryarSupervisorVisit"')) {
          return [
            {
              id: 'visit-1',
              marketId: 'market-1',
              supervisorId: 'supervisor-1',
              checkInAt: '2026-06-01T09:00:00.000Z',
              gpsLocation: '36.191, 44.009',
              soldCartons: 12,
              requestedCartons: 4,
              issue: 'No blocker',
              decisionMaker: 'Store owner',
              requestDetails: 'Four cartons requested',
              report: 'Visit completed',
            },
          ];
        }

        if (sql.includes('"_shahryarWorkingTime"')) {
          return [
            {
              id: 'working-time-1',
              supervisorId: 'supervisor-1',
              workDate: '2026-06-01T00:00:00.000Z',
              checkInAt: '2026-06-01T08:00:00.000Z',
              checkOutAt: '2026-06-01T16:00:00.000Z',
              gpsLocation: '36.191, 44.009',
              totalMinutes: 480,
              status: 'PRESENT',
            },
          ];
        }

        if (sql.includes('"_shahryarPayment"')) {
          return [
            {
              id: 'payment-1',
              marketId: 'market-1',
              collectedById: 'supervisor-1',
              paidAt: '2026-06-01T10:00:00.000Z',
              dueDate: '2026-06-01T00:00:00.000Z',
              amount: 250000,
              status: 'CLOSED',
              notes: 'Paid in cash',
            },
          ];
        }

        if (sql.includes('"_shahryarSupervisorPenalty"')) {
          return [
            {
              id: 'penalty-1',
              supervisorId: 'supervisor-1',
              penaltyDate: '2026-06-01T12:00:00.000Z',
              amount: 10000,
              reason: 'Late report',
              decidedBy: 'Admin',
            },
          ];
        }

        if (sql.includes('"_shahryarAbsence"')) {
          return [
            {
              id: 'absence-1',
              supervisorId: 'supervisor-1',
              absenceDate: '2026-06-01T00:00:00.000Z',
              workingTime: 'No check-in',
              gpsLocation: '-',
              reason: 'ABSENT',
              notes: 'Absent',
            },
          ];
        }

        return [];
      });
    const service = new ShahryarReportService(createMockDataSource(query));

    const sections = await service.getRecordSections(
      '20202020-0000-4000-8000-000000000001',
    );

    expect(sections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '/shahryar/markets',
          canCreate: true,
          rows: [
            [
              'Center Market',
              'Store Owner',
              '0750 000 0001',
              'Erbil',
              '36.191, 44.009',
              '-',
              'پارەدان کرا',
              'Weekly follow-up',
            ],
          ],
        }),
        expect.objectContaining({
          path: '/shahryar/supervisor-visits',
          canCreate: true,
          rows: [
            [
              'Karwan Shahryar',
              'Center Market',
              '09:00',
              '36.191, 44.009',
              '-',
              '12',
              'No blocker',
              'Store owner',
              'Four cartons requested',
              'Visit completed',
            ],
          ],
        }),
        expect.objectContaining({
          path: '/shahryar/working-times',
          canCreate: true,
          rows: [
            [
              'Karwan Shahryar',
              '2026-06-01',
              '08:00',
              '16:00',
              '36.191, 44.009',
              '480',
              'ئامادە',
            ],
          ],
        }),
      ]),
    );
  });

  it('should expose supervisor write permissions for record sections', async () => {
    const query = jest.fn<Promise<unknown>, [string, unknown[]?]>();
    const service = new ShahryarReportService(createMockDataSource(query));

    const sections = await service.getRecordSections(undefined, {
      authorizedSupervisorId: 'supervisor-1',
    });
    const canCreateByPath = Object.fromEntries(
      sections.map((section) => [section.path, section.canCreate]),
    );

    expect(canCreateByPath).toMatchObject({
      '/shahryar/markets': false,
      '/shahryar/supervisor-visits': true,
      '/shahryar/working-times': true,
      '/shahryar/payments': true,
      '/shahryar/supervisor-penalties': false,
      '/shahryar/absences': false,
    });
  });

  it('should persist created market records to the workspace table', async () => {
    const query = jest
      .fn<Promise<unknown>, [string, unknown[]?]>()
      .mockResolvedValueOnce([{ id: 'supervisor-1' }])
      .mockResolvedValueOnce([]);
    const service = new ShahryarReportService(createMockDataSource(query));

    const response = await service.createRecord({
      workspaceId: '20202020-0000-4000-8000-000000000001',
      request: {
        path: '/shahryar/markets',
        values: {
          name: 'مارکێتی نوێ',
          ownerName: 'ڕێباز عەلی',
          phoneNumber: '0750 000 0004',
          marketAddress: 'سلێمانی',
          gpsLocation: '35.557, 45.435',
          paymentStatus: 'بەشێک دراوە',
          notes: 'پێویستی بە سەردان هەیە',
        },
      },
    });

    expect(response.path).toBe('/shahryar/markets');
    const marketInsertParameters = query.mock.calls[1][1];

    if (marketInsertParameters === undefined) {
      throw new Error('Expected market insert parameters');
    }

    expect(response.id).toEqual(marketInsertParameters[0]);
    expect(response.row).toEqual([
      'مارکێتی نوێ',
      'ڕێباز عەلی',
      '0750 000 0004',
      'سلێمانی',
      '35.557, 45.435',
      '-',
      'بەشێک دراوە',
      'پێویستی بە سەردان هەیە',
    ]);
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0][0]).toContain('"workspaceMember"');
    expect(query.mock.calls[1][0]).toContain('INSERT INTO "workspace_');
    expect(query.mock.calls[1][0]).toContain('"."_shahryarMarket"');
    expect(query.mock.calls[1][1]).toEqual([
      expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      ),
      'مارکێتی نوێ',
      'ڕێباز عەلی',
      '0750 000 0004',
      'supervisor-1',
      '35.557, 45.435',
      'سلێمانی',
      'PARTIAL',
      'پێویستی بە سەردان هەیە',
      response.createdAt,
    ]);
  });

  it('should reject supervisor attempts to create admin-owned record sections', async () => {
    const query = jest.fn<Promise<unknown>, [string, unknown[]?]>();
    const service = new ShahryarReportService(createMockDataSource(query));

    await expect(
      service.createRecord({
        authorizedSupervisorId: 'supervisor-1',
        workspaceId: '20202020-0000-4000-8000-000000000001',
        request: {
          path: '/shahryar/markets',
          values: {
            name: 'مارکێتی نوێ',
          },
        },
      }),
    ).rejects.toThrow('Supervisors can only create their own');
    expect(query).not.toHaveBeenCalled();
  });

  it('should persist supervisor visit records only for assigned markets', async () => {
    const query = jest
      .fn<Promise<unknown>, [string, unknown[]?]>()
      .mockResolvedValueOnce([{ id: 'supervisor-1' }])
      .mockResolvedValueOnce([{ id: 'market-1' }])
      .mockResolvedValueOnce([{ id: 'market-1' }])
      .mockResolvedValueOnce([]);
    const service = new ShahryarReportService(createMockDataSource(query));

    const response = await service.createRecord({
      authorizedSupervisorId: 'supervisor-1',
      workspaceId: '20202020-0000-4000-8000-000000000001',
      request: {
        path: '/shahryar/supervisor-visits',
        values: {
          supervisor: 'Karwan Shahryar',
          market: 'Center Market',
          checkInAt: '09:00',
          gpsLocation: '36.191, 44.009',
          soldCartons: '12',
          issue: 'No blocker',
          decisionMaker: 'Store owner',
          requestDetails: 'Four cartons requested',
          report: 'Visit completed',
        },
      },
    });

    expect(response.path).toBe('/shahryar/supervisor-visits');
    const visitInsertParameters = query.mock.calls[3][1];

    if (visitInsertParameters === undefined) {
      throw new Error('Expected supervisor visit insert parameters');
    }

    expect(response.id).toEqual(visitInsertParameters[0]);
    expect(query).toHaveBeenCalledTimes(4);
    expect(query.mock.calls[2][0]).toContain('"assignedSupervisorId" = $2');
    expect(query.mock.calls[3][0]).toContain('INSERT INTO "workspace_');
  });
});
