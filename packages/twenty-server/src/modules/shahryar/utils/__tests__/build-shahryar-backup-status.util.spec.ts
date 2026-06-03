import { ShahryarBackupService } from 'src/modules/shahryar/services/shahryar-backup.service';
import { type DataSource } from 'typeorm';

const createMockDataSource = (query: jest.Mock<Promise<unknown>, [string]>) =>
  ({
    query,
  }) as unknown as DataSource;

describe('ShahryarBackupService', () => {
  it('should expose healthy backup status from Postgres archive history', async () => {
    const query = jest.fn<Promise<unknown>, [string]>().mockResolvedValue([
      {
        checkedAt: '2026-06-01T10:00:00.000Z',
        databaseName: 'twenty',
        dataSizeLabel: '42 MB',
        archivedCount: '12',
        failedCount: '0',
        lastSuccessfulBackupAt: '2026-06-01T09:45:00.000Z',
        lastFailedBackupAt: null,
        lastFailedWal: null,
      },
    ]);
    const service = new ShahryarBackupService(createMockDataSource(query));

    await expect(service.getStatus()).resolves.toEqual({
      status: 'healthy',
      label: 'Healthy',
      lastRunLabel: '2026-06-01 09:45 UTC',
      lastSuccessfulBackupAt: '2026-06-01T09:45:00.000Z',
      lastSuccessfulBackupLabel: '2026-06-01 09:45 UTC',
      nextScheduledBackupAt: '2026-06-02T10:00:00.000Z',
      nextScheduledBackupLabel: '2026-06-02 10:00 UTC',
      intervalHours: 24,
      dataSizeLabel: '42 MB',
      storageScopeLabel: 'Postgres database: twenty',
      operationModeLabel:
        'Postgres backup archive history (12 archived WAL files)',
      manualExport: {
        isAvailable: false,
        label:
          'Manual backup export is not supported by the current platform backup integration',
      },
      history: [
        {
          id: 'postgres-archive-success-2026-06-01T09:45:00.000Z',
          status: 'healthy',
          label: 'Postgres archive completed',
          completedAt: '2026-06-01T09:45:00.000Z',
          completedAtLabel: '2026-06-01 09:45 UTC',
          dataSizeLabel: '42 MB',
          storageScopeLabel: 'Postgres database: twenty',
        },
      ],
    });
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('pg_stat_archiver'),
    );
  });

  it('should return warning empty state when no successful backup has run', async () => {
    const query = jest.fn<Promise<unknown>, [string]>().mockResolvedValue([
      {
        checkedAt: '2026-06-01T10:00:00.000Z',
        databaseName: 'twenty',
        dataSizeLabel: '42 MB',
        archivedCount: '0',
        failedCount: '0',
        lastSuccessfulBackupAt: null,
        lastFailedBackupAt: null,
        lastFailedWal: null,
      },
    ]);
    const service = new ShahryarBackupService(createMockDataSource(query));

    await expect(service.getStatus()).resolves.toEqual({
      status: 'warning',
      label: 'Warning',
      lastRunLabel: 'No successful backup found',
      lastSuccessfulBackupAt: undefined,
      lastSuccessfulBackupLabel: 'No successful backup found',
      nextScheduledBackupAt: '2026-06-02T10:00:00.000Z',
      nextScheduledBackupLabel: '2026-06-02 10:00 UTC',
      intervalHours: 24,
      dataSizeLabel: '42 MB',
      storageScopeLabel: 'Postgres database: twenty',
      operationModeLabel:
        'Postgres backup archive history (0 archived WAL files)',
      failureReason:
        'No completed Postgres archive backup has been reported yet',
      manualExport: {
        isAvailable: false,
        label:
          'Manual backup export is not supported by the current platform backup integration',
      },
      history: [],
    });
  });

  it('should return failed status when the latest archive event failed', async () => {
    const query = jest.fn<Promise<unknown>, [string]>().mockResolvedValue([
      {
        checkedAt: '2026-06-01T10:00:00.000Z',
        databaseName: 'twenty',
        dataSizeLabel: '42 MB',
        archivedCount: '12',
        failedCount: '2',
        lastSuccessfulBackupAt: '2026-06-01T08:00:00.000Z',
        lastFailedBackupAt: '2026-06-01T09:30:00.000Z',
        lastFailedWal: '00000001000000000000000A',
      },
    ]);
    const service = new ShahryarBackupService(createMockDataSource(query));

    await expect(service.getStatus()).resolves.toEqual({
      status: 'failed',
      label: 'Failed',
      lastRunLabel: '2026-06-01 08:00 UTC',
      lastSuccessfulBackupAt: '2026-06-01T08:00:00.000Z',
      lastSuccessfulBackupLabel: '2026-06-01 08:00 UTC',
      nextScheduledBackupAt: '2026-06-02T10:00:00.000Z',
      nextScheduledBackupLabel: '2026-06-02 10:00 UTC',
      intervalHours: 24,
      dataSizeLabel: '42 MB',
      storageScopeLabel: 'Postgres database: twenty',
      operationModeLabel:
        'Postgres backup archive history (12 archived WAL files)',
      failureReason:
        'Postgres failed while archiving WAL 00000001000000000000000A',
      manualExport: {
        isAvailable: false,
        label:
          'Manual backup export is not supported by the current platform backup integration',
      },
      history: [
        {
          id: 'postgres-archive-failed-2026-06-01T09:30:00.000Z',
          status: 'failed',
          label: 'Postgres archive failed',
          completedAt: '2026-06-01T09:30:00.000Z',
          completedAtLabel: '2026-06-01 09:30 UTC',
          dataSizeLabel: '42 MB',
          storageScopeLabel: 'Postgres database: twenty',
          failureReason:
            'Postgres failed while archiving WAL 00000001000000000000000A',
        },
        {
          id: 'postgres-archive-success-2026-06-01T08:00:00.000Z',
          status: 'healthy',
          label: 'Postgres archive completed',
          completedAt: '2026-06-01T08:00:00.000Z',
          completedAtLabel: '2026-06-01 08:00 UTC',
          dataSizeLabel: '42 MB',
          storageScopeLabel: 'Postgres database: twenty',
        },
      ],
    });
  });

  it('should return failure status when database backup status is unavailable', async () => {
    const query = jest
      .fn<Promise<unknown>, [string]>()
      .mockRejectedValue(new Error('database unavailable'));
    const service = new ShahryarBackupService(createMockDataSource(query));

    const status = await service.getStatus();

    expect(status).toMatchObject({
      status: 'failed',
      label: 'Failed',
      lastRunLabel: 'Unknown',
      lastSuccessfulBackupLabel: 'No successful backup found',
      intervalHours: 24,
      dataSizeLabel: 'Unknown',
      storageScopeLabel: 'Postgres database backup metadata',
      operationModeLabel: 'Database backup status unavailable',
      failureReason: 'database unavailable',
      manualExport: {
        isAvailable: false,
        label:
          'Manual backup export is not supported by the current platform backup integration',
      },
    });
    expect(status.history).toHaveLength(1);
    expect(status.history[0]).toMatchObject({
      status: 'failed',
      label: 'Backup status query failed',
      failureReason: 'database unavailable',
    });
  });

  it('should expose seed backup status for fallback report data', () => {
    const service = new ShahryarBackupService(
      createMockDataSource(jest.fn<Promise<unknown>, [string]>()),
    );

    expect(service.getSeedStatus()).toEqual({
      status: 'healthy',
      label: 'Healthy',
      lastRunLabel: '2026-06-01 02:15 UTC',
      lastSuccessfulBackupAt: '2026-06-01T02:15:00.000Z',
      lastSuccessfulBackupLabel: '2026-06-01 02:15 UTC',
      nextScheduledBackupLabel: '2026-06-02 02:15 UTC',
      intervalHours: 24,
      dataSizeLabel: '1.8 GB',
      storageScopeLabel: 'Postgres + فایلە پەیوەندیدارەکان',
      operationModeLabel: 'Existing database backup operations',
      manualExport: {
        isAvailable: false,
        label:
          'Manual backup export is not supported by the current platform backup integration',
      },
      history: [
        {
          id: 'seed-backup-success-2026-06-01T02:15:00.000Z',
          status: 'healthy',
          label: 'Seed backup status',
          completedAt: '2026-06-01T02:15:00.000Z',
          completedAtLabel: '2026-06-01 02:15 UTC',
          dataSizeLabel: '1.8 GB',
          storageScopeLabel: 'Postgres + فایلە پەیوەندیدارەکان',
        },
      ],
    });
  });
});
