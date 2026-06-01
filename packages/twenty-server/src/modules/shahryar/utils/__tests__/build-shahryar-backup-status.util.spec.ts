import { ShahryarBackupService } from 'src/modules/shahryar/services/shahryar-backup.service';
import { type DataSource } from 'typeorm';

const createMockDataSource = (query: jest.Mock<Promise<unknown>, [string]>) =>
  ({
    query,
  }) as unknown as DataSource;

describe('ShahryarBackupService', () => {
  it('should expose backup status from Postgres database readiness', async () => {
    const query = jest.fn<Promise<unknown>, [string]>().mockResolvedValue([
      {
        checkedAt: '2026-06-01T10:00:00.000Z',
        databaseName: 'twenty',
        dataSizeLabel: '42 MB',
      },
    ]);
    const service = new ShahryarBackupService(createMockDataSource(query));

    await expect(service.getStatus()).resolves.toEqual({
      status: 'healthy',
      label: 'Healthy',
      lastRunLabel: '2026-06-01 10:00 UTC',
      intervalHours: 24,
      dataSizeLabel: '42 MB',
      storageScopeLabel: 'Postgres database: twenty',
      operationModeLabel: 'Postgres backup readiness verified',
    });
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('pg_size_pretty'),
    );
  });

  it('should return warning status when database backup status is unavailable', async () => {
    const query = jest
      .fn<Promise<unknown>, [string]>()
      .mockRejectedValue(new Error('database unavailable'));
    const service = new ShahryarBackupService(createMockDataSource(query));

    await expect(service.getStatus()).resolves.toEqual({
      status: 'warning',
      label: 'Warning',
      lastRunLabel: '2026-06-01 02:15 UTC',
      intervalHours: 24,
      dataSizeLabel: 'Unknown',
      storageScopeLabel: 'Postgres + فایلە پەیوەندیدارەکان',
      operationModeLabel: 'Database backup status unavailable',
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
      intervalHours: 24,
      dataSizeLabel: '1.8 GB',
      storageScopeLabel: 'Postgres + فایلە پەیوەندیدارەکان',
      operationModeLabel: 'Existing database backup operations',
    });
  });
});
