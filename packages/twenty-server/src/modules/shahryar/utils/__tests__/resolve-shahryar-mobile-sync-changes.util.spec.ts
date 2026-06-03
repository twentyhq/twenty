import { ForbiddenException } from '@nestjs/common';

import {
  type ShahryarMobileSyncRequestDTO,
  type ShahryarMobileVisitSyncChangeDTO,
} from 'src/modules/shahryar/dtos/shahryar-mobile-sync.dto';
import { ShahryarMobileSyncService } from 'src/modules/shahryar/services/shahryar-mobile-sync.service';
import { resolveShahryarMobileSyncChanges } from 'src/modules/shahryar/utils/resolve-shahryar-mobile-sync-changes.util';
import { type DataSource } from 'typeorm';

const uploadedPhotoFileId = '550e8400-e29b-41d4-a716-446655440000';
const existingPhotoFileId = '550e8400-e29b-41d4-a716-446655440001';

const baseChange = {
  localId: 'local-visit-1',
  serverId: 'server-visit-1',
  operation: 'update',
  assignedMarketId: 'market-1',
  supervisorId: 'supervisor-1',
  checkInAt: '2026-06-01T09:00:00.000Z',
  gpsLocation: {
    latitude: 36.191,
    longitude: 44.009,
  },
  photoFileIds: [uploadedPhotoFileId],
  soldCartons: 12,
  requestedCartons: 4,
  issue: 'Late payment follow-up',
  decisionMaker: 'Store owner',
  requestDetails: 'Four cartons requested',
  report: 'Visit completed',
  baseServerUpdatedAt: '2026-06-01T09:10:00.000Z',
  clientUpdatedAt: '2026-06-01T09:30:00.000Z',
} satisfies ShahryarMobileVisitSyncChangeDTO;

const createMockDataSource = (query = jest.fn()) =>
  ({
    query,
  }) as unknown as DataSource;

describe('resolveShahryarMobileSyncChanges', () => {
  it('should accept new and unchanged updates', () => {
    const response = resolveShahryarMobileSyncChanges({
      deviceId: 'device-1',
      syncedAt: '2026-06-01T10:00:00.000Z',
      changes: [
        baseChange,
        {
          ...baseChange,
          localId: 'local-visit-2',
          serverId: undefined,
          operation: 'create',
        },
      ],
      serverVisits: [
        {
          id: 'server-visit-1',
          updatedAt: '2026-06-01T09:10:00.000Z',
        },
      ],
    });

    expect(response.acceptedChanges).toEqual([
      {
        localId: 'local-visit-1',
        recordKind: 'visit',
        serverId: 'server-visit-1',
        operation: 'update',
        acceptedAt: '2026-06-01T10:00:00.000Z',
      },
      {
        localId: 'local-visit-2',
        recordKind: 'visit',
        serverId: 'server-local-visit-2',
        operation: 'create',
        acceptedAt: '2026-06-01T10:00:00.000Z',
      },
    ]);
    expect(response.conflicts).toHaveLength(0);
    expect(response.rejectedChanges).toHaveLength(0);
  });

  it('should return server-newer conflicts using base server timestamps', () => {
    const response = resolveShahryarMobileSyncChanges({
      deviceId: 'device-1',
      syncedAt: '2026-06-01T10:00:00.000Z',
      changes: [baseChange],
      serverVisits: [
        {
          id: 'server-visit-1',
          updatedAt: '2026-06-01T09:40:00.000Z',
        },
      ],
    });

    expect(response.acceptedChanges).toHaveLength(0);
    expect(response.conflicts).toEqual([
      {
        localId: 'local-visit-1',
        serverId: 'server-visit-1',
        recordKind: 'visit',
        reason: 'server-newer',
        clientUpdatedAt: '2026-06-01T09:30:00.000Z',
        serverUpdatedAt: '2026-06-01T09:40:00.000Z',
      },
    ]);
  });

  it('should reject invalid changes before accepting valid changes', () => {
    const response = resolveShahryarMobileSyncChanges({
      deviceId: 'device-1',
      syncedAt: '2026-06-01T10:00:00.000Z',
      changes: [
        {
          ...baseChange,
          localId: 'local-negative',
          soldCartons: -1,
        },
        {
          ...baseChange,
          localId: 'local-invalid-date',
          checkInAt: 'not-a-date',
        },
        {
          ...baseChange,
          localId: 'local-missing-server-id',
          serverId: undefined,
        },
      ],
      serverVisits: [],
    });

    expect(response.rejectedChanges).toEqual([
      {
        localId: 'local-negative',
        recordKind: 'visit',
        reason: 'invalid-carton-count',
      },
      {
        localId: 'local-invalid-date',
        recordKind: 'visit',
        reason: 'invalid-timestamp',
      },
      {
        localId: 'local-missing-server-id',
        recordKind: 'visit',
        reason: 'missing-server-id',
      },
    ]);
  });

  it('should reject changes for another supervisor when scoped to a workspace member', () => {
    const response = resolveShahryarMobileSyncChanges({
      authorizedSupervisorId: 'supervisor-2',
      deviceId: 'device-1',
      syncedAt: '2026-06-01T10:00:00.000Z',
      changes: [baseChange],
      serverVisits: [],
    });

    expect(response.acceptedChanges).toHaveLength(0);
    expect(response.rejectedChanges).toEqual([
      {
        localId: 'local-visit-1',
        recordKind: 'visit',
        reason: 'unauthorized-supervisor',
      },
    ]);
  });

  it('should accept typed non-visit mobile records', () => {
    const response = resolveShahryarMobileSyncChanges({
      deviceId: 'device-1',
      syncedAt: '2026-06-01T10:00:00.000Z',
      changes: [
        {
          recordKind: 'working-time',
          localId: 'local-working-time-1',
          operation: 'create',
          supervisorId: 'supervisor-1',
          workDate: '2026-06-01',
          checkInAt: '2026-06-01T08:00:00.000Z',
          gpsLocation: {
            latitude: 36.191,
            longitude: 44.009,
          },
          totalMinutes: 480,
          status: 'PRESENT',
          clientUpdatedAt: '2026-06-01T08:01:00.000Z',
        },
        {
          recordKind: 'payment',
          localId: 'local-payment-1',
          operation: 'create',
          marketId: 'market-1',
          collectedById: 'supervisor-1',
          amount: 250,
          paidAt: '2026-06-01',
          status: 'PARTIAL',
          clientUpdatedAt: '2026-06-01T09:00:00.000Z',
        },
        {
          recordKind: 'absence',
          localId: 'local-absence-1',
          operation: 'create',
          supervisorId: 'supervisor-1',
          absenceDate: '2026-06-01',
          gpsLocation: {
            latitude: 36.191,
            longitude: 44.009,
          },
          reason: 'ABSENT',
          clientUpdatedAt: '2026-06-01T09:30:00.000Z',
        },
      ],
      serverRecords: [],
    });

    expect(response.acceptedChanges.map((change) => change.recordKind)).toEqual(
      ['working-time', 'payment', 'absence'],
    );
    expect(response.rejectedChanges).toHaveLength(0);
  });
});

describe('ShahryarMobileSyncService', () => {
  it('should expose the mobile sync response contract', async () => {
    const service = new ShahryarMobileSyncService(createMockDataSource());
    const request = {
      deviceId: 'device-1',
      changes: [baseChange],
    } satisfies ShahryarMobileSyncRequestDTO;

    const response = await service.resolveSyncRequest({
      authorizedSupervisorId: 'supervisor-1',
      request,
      syncedAt: '2026-06-01T10:00:00.000Z',
    });

    expect(response).toMatchObject({
      deviceId: 'device-1',
      nextPullCursor: '2026-06-01T10:00:00.000Z',
      acceptedChanges: [
        {
          localId: 'local-visit-1',
          recordKind: 'visit',
          serverId: 'server-visit-1',
          operation: 'update',
        },
      ],
    });
  });

  it('should persist accepted create sync changes to the workspace visit table', async () => {
    const query = jest.fn<Promise<unknown>, [string, unknown[]]>();
    const service = new ShahryarMobileSyncService(createMockDataSource(query));
    const request = {
      deviceId: 'device-1',
      changes: [
        {
          ...baseChange,
          localId: 'local-create-1',
          operation: 'create',
          serverId: undefined,
        },
      ],
    } satisfies ShahryarMobileSyncRequestDTO;

    query.mockResolvedValue([]);

    const response = await service.resolveSyncRequest({
      authorizedSupervisorId: 'supervisor-1',
      request,
      syncedAt: '2026-06-01T10:00:00.000Z',
      workspaceId: '20202020-0000-4000-8000-000000000001',
    });

    expect(response.acceptedChanges).toHaveLength(1);
    expect(response.acceptedChanges[0].serverId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(query).toHaveBeenCalledTimes(5);
    expect(query.mock.calls[4][0]).toContain('INSERT INTO "workspace_');
    expect(query.mock.calls[4][0]).toContain('"."_shahryarSupervisorVisit"');
    expect(query.mock.calls[4][1][0]).toBe(
      response.acceptedChanges[0].serverId,
    );
  });

  it('should persist accepted non-visit sync changes to workspace tables', async () => {
    const query = jest.fn<Promise<unknown>, [string, unknown[]]>();
    const service = new ShahryarMobileSyncService(createMockDataSource(query));
    const request = {
      deviceId: 'device-1',
      changes: [
        {
          recordKind: 'working-time',
          localId: 'local-working-time-1',
          operation: 'create',
          supervisorId: 'supervisor-1',
          workDate: '2026-06-01',
          checkInAt: '2026-06-01T08:00:00.000Z',
          gpsLocation: {
            latitude: 36.191,
            longitude: 44.009,
          },
          totalMinutes: 480,
          status: 'PRESENT',
          clientUpdatedAt: '2026-06-01T08:01:00.000Z',
        },
        {
          recordKind: 'payment',
          localId: 'local-payment-1',
          operation: 'create',
          marketId: 'market-1',
          collectedById: 'supervisor-1',
          amount: 250,
          paidAt: '2026-06-01',
          status: 'PARTIAL',
          clientUpdatedAt: '2026-06-01T09:00:00.000Z',
        },
        {
          recordKind: 'absence',
          localId: 'local-absence-1',
          operation: 'create',
          supervisorId: 'supervisor-1',
          absenceDate: '2026-06-01',
          gpsLocation: {
            latitude: 36.191,
            longitude: 44.009,
          },
          reason: 'ABSENT',
          clientUpdatedAt: '2026-06-01T09:30:00.000Z',
        },
      ],
    } satisfies ShahryarMobileSyncRequestDTO;

    query.mockResolvedValue([]);

    const response = await service.resolveSyncRequest({
      authorizedSupervisorId: 'supervisor-1',
      request,
      syncedAt: '2026-06-01T10:00:00.000Z',
      workspaceId: '20202020-0000-4000-8000-000000000001',
    });

    expect(response.acceptedChanges).toHaveLength(3);
    expect(query.mock.calls.map((call) => call[0]).join('\n')).toContain(
      '"."_shahryarWorkingTime"',
    );
    expect(query.mock.calls.map((call) => call[0]).join('\n')).toContain(
      '"."_shahryarPayment"',
    );
    expect(query.mock.calls.map((call) => call[0]).join('\n')).toContain(
      '"."_shahryarAbsence"',
    );
  });

  it('should expose mobile pull, photo association and notification contracts', async () => {
    const service = new ShahryarMobileSyncService(createMockDataSource());

    expect(
      await service.getPullResponse({
        syncedAt: '2026-06-01T10:00:00.000Z',
        serverVisits: [
          {
            id: 'server-visit-1',
            updatedAt: '2026-06-01T09:30:00.000Z',
          },
        ],
      }),
    ).toMatchObject({
      serverTime: '2026-06-01T10:00:00.000Z',
      nextPullCursor: '2026-06-01T10:00:00.000Z',
      assignedMarkets: expect.arrayContaining([
        expect.objectContaining({
          id: '20202020-0101-4000-8000-000000000001',
          debtStatus: 'paid',
        }),
        expect.objectContaining({
          id: '20202020-0101-4000-8000-000000000004',
          debtStatus: 'partial',
        }),
      ]),
      serverVisits: [
        {
          id: 'server-visit-1',
          updatedAt: '2026-06-01T09:30:00.000Z',
        },
      ],
      serverRecords: [
        {
          id: 'server-visit-1',
          recordKind: 'visit',
          updatedAt: '2026-06-01T09:30:00.000Z',
        },
      ],
    });

    expect(
      await service.getPullResponse({
        assignedSupervisorId: '20202020-0687-4c41-b707-ed1bfca972a7',
        syncedAt: '2026-06-01T10:00:00.000Z',
      }),
    ).toMatchObject({
      currentSupervisorId: '20202020-0687-4c41-b707-ed1bfca972a7',
      assignedMarkets: [
        expect.objectContaining({
          id: '20202020-0101-4000-8000-000000000001',
          name: 'مارکێتی ئارام',
        }),
      ],
    });

    expect(
      await service.associatePhoto({
        associatedAt: '2026-06-01T10:00:00.000Z',
        request: {
          localPhotoId: 'local-photo-1',
          fileId: uploadedPhotoFileId,
          targetType: 'visit',
          targetId: 'server-visit-1',
          capturedAt: '2026-06-01T09:10:00.000Z',
        },
      }),
    ).toEqual({
      localPhotoId: 'local-photo-1',
      fileId: uploadedPhotoFileId,
      targetType: 'visit',
      targetId: 'server-visit-1',
      associatedAt: '2026-06-01T10:00:00.000Z',
    });

    await expect(
      service.registerNotifications({
        registeredAt: '2026-06-01T10:00:00.000Z',
        request: {
          deviceId: 'ios-device-1',
          expoPushToken: 'ExponentPushToken[test]',
          platform: 'ios',
        },
      }),
    ).resolves.toEqual({
      deviceId: 'ios-device-1',
      registeredAt: '2026-06-01T10:00:00.000Z',
      enabledNotificationKinds: ['missing-report', 'missed-visit'],
    });
  });

  it('should persist mobile photo associations to the workspace files field', async () => {
    const query = jest.fn<Promise<unknown>, [string, unknown[]]>();
    const service = new ShahryarMobileSyncService(createMockDataSource(query));

    query
      .mockResolvedValueOnce([
        {
          path: 'files-field/20202020-147c-4d5f-9c13-000000000001/uploaded-photo.jpg',
        },
      ])
      .mockResolvedValueOnce([
        {
          files: [
            {
              fileId: existingPhotoFileId,
              label: 'existing-photo.jpg',
              extension: '.jpg',
            },
          ],
        },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await expect(
      service.associatePhoto({
        associatedAt: '2026-06-01T10:00:00.000Z',
        request: {
          localPhotoId: 'file:///tmp/mobile-photo.jpg',
          fileId: uploadedPhotoFileId,
          targetType: 'visit',
          targetId: 'server-visit-1',
          capturedAt: '2026-06-01T09:10:00.000Z',
        },
        workspaceId: '20202020-0000-4000-8000-000000000001',
      }),
    ).resolves.toEqual({
      localPhotoId: 'file:///tmp/mobile-photo.jpg',
      fileId: uploadedPhotoFileId,
      targetType: 'visit',
      targetId: 'server-visit-1',
      associatedAt: '2026-06-01T10:00:00.000Z',
    });

    expect(query).toHaveBeenCalledTimes(4);
    expect(query.mock.calls[1][0]).toContain('FROM "workspace_');
    expect(query.mock.calls[1][0]).toContain('"."_shahryarSupervisorVisit"');
    expect(query.mock.calls[2][0]).toContain('SET "photos" = $1::jsonb');

    const updatedFiles = JSON.parse(
      query.mock.calls[2][1][0] as string,
    ) as Array<{ fileId: string; label: string; extension: string }>;

    expect(updatedFiles).toEqual([
      {
        fileId: existingPhotoFileId,
        label: 'existing-photo.jpg',
        extension: '.jpg',
      },
      {
        fileId: uploadedPhotoFileId,
        label: 'mobile-photo.jpg',
        extension: '.jpg',
      },
    ]);
    expect(query.mock.calls[3][0]).toContain('UPDATE "core"."file"');
    expect(query.mock.calls[3][1]).toEqual([
      JSON.stringify({
        isTemporaryFile: false,
        toDelete: false,
      }),
      '2026-06-01T10:00:00.000Z',
      uploadedPhotoFileId,
      '20202020-0000-4000-8000-000000000001',
    ]);
  });

  it('should reject supervisor photo associations for records owned by another supervisor', async () => {
    const query = jest.fn<Promise<unknown>, [string, unknown[]]>();
    const service = new ShahryarMobileSyncService(createMockDataSource(query));

    query
      .mockResolvedValueOnce([
        {
          path: 'files/photo.jpg',
        },
      ])
      .mockResolvedValueOnce([
        {
          files: [],
          ownerId: 'supervisor-2',
        },
      ]);

    await expect(
      service.associatePhoto({
        associatedAt: '2026-06-01T10:00:00.000Z',
        authorizedSupervisorId: 'supervisor-1',
        request: {
          localPhotoId: 'photo.jpg',
          fileId: uploadedPhotoFileId,
          targetType: 'market',
          targetId: 'market-1',
          capturedAt: '2026-06-01T09:10:00.000Z',
        },
        workspaceId: '20202020-0000-4000-8000-000000000001',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[1][0]).toContain(
      '"assignedSupervisorId" AS "ownerId"',
    );
  });

  it('should persist mobile notification registrations to the workspace device table', async () => {
    const query = jest.fn<Promise<unknown>, [string, unknown[]]>();
    const service = new ShahryarMobileSyncService(createMockDataSource(query));

    query.mockResolvedValueOnce([]);
    query.mockResolvedValueOnce([]);

    await expect(
      service.registerNotifications({
        registeredAt: '2026-06-01T10:00:00.000Z',
        request: {
          deviceId: 'ios-device-1',
          expoPushToken: 'ExponentPushToken[test]',
          platform: 'ios',
        },
        workspaceId: '20202020-0000-4000-8000-000000000001',
        workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
      }),
    ).resolves.toEqual({
      deviceId: 'ios-device-1',
      registeredAt: '2026-06-01T10:00:00.000Z',
      enabledNotificationKinds: ['missing-report', 'missed-visit'],
    });

    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0][0]).toContain('FROM "workspace_');
    expect(query.mock.calls[0][0]).toContain('"."_shahryarMobileDevice"');
    expect(query.mock.calls[1][0]).toContain('INSERT INTO "workspace_');
    expect(query.mock.calls[1][1]).toEqual([
      expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      ),
      'ios device ios-device-1',
      'ios-device-1',
      'ExponentPushToken[test]',
      'IOS',
      'missing-report,missed-visit',
      '2026-06-01T10:00:00.000Z',
      '20202020-0687-4c41-b707-ed1bfca972a7',
      '2026-06-01T10:00:00.000Z',
    ]);
  });

  it('should update existing mobile notification registrations', async () => {
    const query = jest.fn<Promise<unknown>, [string, unknown[]]>();
    const service = new ShahryarMobileSyncService(createMockDataSource(query));

    query.mockResolvedValueOnce([{ id: 'mobile-device-record-1' }]);
    query.mockResolvedValueOnce([]);

    await service.registerNotifications({
      registeredAt: '2026-06-01T10:05:00.000Z',
      request: {
        deviceId: 'android-device-1',
        expoPushToken: 'ExponentPushToken[updated]',
        platform: 'android',
      },
      workspaceId: '20202020-0000-4000-8000-000000000001',
      workspaceMemberId: '20202020-77d5-4cb6-b60a-f4a835a85d61',
    });

    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[1][0]).toContain('UPDATE "workspace_');
    expect(query.mock.calls[1][1]).toEqual([
      'android device android-device-1',
      'ExponentPushToken[updated]',
      'ANDROID',
      'missing-report,missed-visit',
      '2026-06-01T10:05:00.000Z',
      '20202020-77d5-4cb6-b60a-f4a835a85d61',
      '2026-06-01T10:05:00.000Z',
      'mobile-device-record-1',
    ]);
  });
});
