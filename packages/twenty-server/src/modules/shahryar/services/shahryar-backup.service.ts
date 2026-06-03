import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { type DataSource } from 'typeorm';

import { SHAHRYAR_REPORT_SOURCE } from 'src/modules/shahryar/constants/shahryar-report-source.constant';
import {
  type ShahryarBackupHistoryEntryDTO,
  type ShahryarBackupManualExportDTO,
  type ShahryarBackupStatus,
  type ShahryarBackupStatusDTO,
} from 'src/modules/shahryar/dtos/shahryar-backup.dto';

type ShahryarBackupDatabaseStatusRow = {
  checkedAt: Date | string;
  archivedCount: number | string | null;
  dataSizeLabel: string;
  databaseName: string;
  failedCount: number | string | null;
  lastFailedBackupAt: Date | string | null;
  lastFailedWal: string | null;
  lastSuccessfulBackupAt: Date | string | null;
};

const BACKUP_INTERVAL_HOURS = 24;
const SHAHRYAR_SEED_BACKUP_COMPLETED_AT = '2026-06-01T02:15:00.000Z';

const MANUAL_EXPORT_UNAVAILABLE: ShahryarBackupManualExportDTO = {
  isAvailable: false,
  label:
    'Manual backup export is not supported by the current platform backup integration',
};

const toBackupStatus = (label: string): ShahryarBackupStatus => {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes('failed')) {
    return 'failed';
  }

  if (normalizedLabel.includes('warning')) {
    return 'warning';
  }

  return 'healthy';
};

const toDate = (value: Date | string | null): Date | undefined => {
  if (value === null) {
    return undefined;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
};

const toBackupTimestampLabel = (value: Date): string =>
  `${value.toISOString().slice(0, 16).replace('T', ' ')} UTC`;

const addHours = (date: Date, hours: number): Date =>
  new Date(date.getTime() + hours * 60 * 60 * 1000);

const toOptionalNumber = (
  value: number | string | null,
): number | undefined => {
  if (value === null) {
    return undefined;
  }

  const numberValue = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const buildFailureReason = ({
  failedCount,
  lastFailedWal,
}: {
  failedCount: number | undefined;
  lastFailedWal: string | null;
}): string =>
  lastFailedWal === null || lastFailedWal.trim().length === 0
    ? `Postgres reported ${failedCount ?? 1} backup/archive failure(s)`
    : `Postgres failed while archiving WAL ${lastFailedWal}`;

const buildBackupHistory = ({
  dataSizeLabel,
  databaseStatus,
  storageScopeLabel,
}: {
  dataSizeLabel: string;
  databaseStatus: ShahryarBackupDatabaseStatusRow;
  storageScopeLabel: string;
}): ShahryarBackupHistoryEntryDTO[] => {
  const lastSuccessfulBackupAt = toDate(databaseStatus.lastSuccessfulBackupAt);
  const lastFailedBackupAt = toDate(databaseStatus.lastFailedBackupAt);
  const failedCount = toOptionalNumber(databaseStatus.failedCount);
  const history: ShahryarBackupHistoryEntryDTO[] = [];

  if (lastSuccessfulBackupAt !== undefined) {
    history.push({
      id: `postgres-archive-success-${lastSuccessfulBackupAt.toISOString()}`,
      status: 'healthy',
      label: 'Postgres archive completed',
      completedAt: lastSuccessfulBackupAt.toISOString(),
      completedAtLabel: toBackupTimestampLabel(lastSuccessfulBackupAt),
      dataSizeLabel,
      storageScopeLabel,
    });
  }

  if (lastFailedBackupAt !== undefined) {
    history.push({
      id: `postgres-archive-failed-${lastFailedBackupAt.toISOString()}`,
      status: 'failed',
      label: 'Postgres archive failed',
      completedAt: lastFailedBackupAt.toISOString(),
      completedAtLabel: toBackupTimestampLabel(lastFailedBackupAt),
      dataSizeLabel,
      storageScopeLabel,
      failureReason: buildFailureReason({
        failedCount,
        lastFailedWal: databaseStatus.lastFailedWal,
      }),
    });
  }

  return history.sort((firstHistoryEntry, secondHistoryEntry) =>
    secondHistoryEntry.completedAt.localeCompare(firstHistoryEntry.completedAt),
  );
};

const buildSeedBackupHistory = ({
  dataSizeLabel,
  storageScopeLabel,
}: {
  dataSizeLabel: string;
  storageScopeLabel: string;
}): ShahryarBackupHistoryEntryDTO[] => [
  {
    id: `seed-backup-success-${SHAHRYAR_SEED_BACKUP_COMPLETED_AT}`,
    status: 'healthy',
    label: 'Seed backup status',
    completedAt: SHAHRYAR_SEED_BACKUP_COMPLETED_AT,
    completedAtLabel: SHAHRYAR_REPORT_SOURCE.backupStatus.lastRunLabel,
    dataSizeLabel,
    storageScopeLabel,
  },
];

const buildQueryFailureBackupStatus = (
  error: unknown,
): ShahryarBackupStatusDTO => {
  const checkedAt = new Date();
  const nextScheduledBackupAt = addHours(checkedAt, BACKUP_INTERVAL_HOURS);
  const failureReason =
    error instanceof Error
      ? error.message
      : 'Database backup status query failed';

  return {
    status: 'failed',
    label: 'Failed',
    lastRunLabel: 'Unknown',
    lastSuccessfulBackupLabel: 'No successful backup found',
    nextScheduledBackupAt: nextScheduledBackupAt.toISOString(),
    nextScheduledBackupLabel: toBackupTimestampLabel(nextScheduledBackupAt),
    intervalHours: BACKUP_INTERVAL_HOURS,
    dataSizeLabel: 'Unknown',
    storageScopeLabel: 'Postgres database backup metadata',
    operationModeLabel: 'Database backup status unavailable',
    failureReason,
    manualExport: MANUAL_EXPORT_UNAVAILABLE,
    history: [
      {
        id: `backup-status-query-failed-${checkedAt.toISOString()}`,
        status: 'failed',
        label: 'Backup status query failed',
        completedAt: checkedAt.toISOString(),
        completedAtLabel: toBackupTimestampLabel(checkedAt),
        dataSizeLabel: 'Unknown',
        storageScopeLabel: 'Postgres database backup metadata',
        failureReason,
      },
    ],
  };
};

@Injectable()
export class ShahryarBackupService {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  async getStatus(): Promise<ShahryarBackupStatusDTO> {
    try {
      const [databaseStatus] = (await this.coreDataSource.query(
        `SELECT
          NOW() AS "checkedAt",
          current_database() AS "databaseName",
          pg_size_pretty(pg_database_size(current_database())) AS "dataSizeLabel",
          archived_count AS "archivedCount",
          failed_count AS "failedCount",
          last_archived_time AS "lastSuccessfulBackupAt",
          last_failed_time AS "lastFailedBackupAt",
          last_failed_wal AS "lastFailedWal"
        FROM pg_stat_archiver`,
      )) as ShahryarBackupDatabaseStatusRow[];

      if (databaseStatus === undefined) {
        throw new Error('Database backup status query returned no rows');
      }

      const checkedAt = toDate(databaseStatus.checkedAt) ?? new Date();
      const lastSuccessfulBackupAt = toDate(
        databaseStatus.lastSuccessfulBackupAt,
      );
      const lastFailedBackupAt = toDate(databaseStatus.lastFailedBackupAt);
      const nextScheduledBackupAt = addHours(checkedAt, BACKUP_INTERVAL_HOURS);
      const storageScopeLabel = `Postgres database: ${databaseStatus.databaseName}`;
      const history = buildBackupHistory({
        dataSizeLabel: databaseStatus.dataSizeLabel,
        databaseStatus,
        storageScopeLabel,
      });
      const failedCount = toOptionalNumber(databaseStatus.failedCount);
      const archivedCount = toOptionalNumber(databaseStatus.archivedCount);
      const status: ShahryarBackupStatus =
        lastSuccessfulBackupAt === undefined
          ? 'warning'
          : lastFailedBackupAt !== undefined &&
              lastFailedBackupAt > lastSuccessfulBackupAt
            ? 'failed'
            : 'healthy';
      const failureReason =
        status === 'failed'
          ? buildFailureReason({
              failedCount,
              lastFailedWal: databaseStatus.lastFailedWal,
            })
          : status === 'warning'
            ? 'No completed Postgres archive backup has been reported yet'
            : undefined;
      const operationModeLabel =
        archivedCount === undefined
          ? 'Postgres backup archive history'
          : `Postgres backup archive history (${archivedCount} archived WAL files)`;
      const lastSuccessfulBackupLabel =
        lastSuccessfulBackupAt === undefined
          ? 'No successful backup found'
          : toBackupTimestampLabel(lastSuccessfulBackupAt);

      return {
        status,
        label:
          status === 'healthy'
            ? 'Healthy'
            : status === 'warning'
              ? 'Warning'
              : 'Failed',
        lastRunLabel: lastSuccessfulBackupLabel,
        lastSuccessfulBackupAt: lastSuccessfulBackupAt?.toISOString(),
        lastSuccessfulBackupLabel,
        nextScheduledBackupAt: nextScheduledBackupAt.toISOString(),
        nextScheduledBackupLabel: toBackupTimestampLabel(nextScheduledBackupAt),
        intervalHours: BACKUP_INTERVAL_HOURS,
        dataSizeLabel: databaseStatus.dataSizeLabel,
        storageScopeLabel,
        operationModeLabel,
        failureReason,
        manualExport: MANUAL_EXPORT_UNAVAILABLE,
        history,
      };
    } catch (error) {
      return buildQueryFailureBackupStatus(error);
    }
  }

  getSeedStatus(): ShahryarBackupStatusDTO {
    const backupStatus = SHAHRYAR_REPORT_SOURCE.backupStatus;
    const status = toBackupStatus(backupStatus.label);
    const dataSizeLabel = '1.8 GB';
    const storageScopeLabel = 'Postgres + فایلە پەیوەندیدارەکان';

    return {
      status,
      label: backupStatus.label,
      lastRunLabel: backupStatus.lastRunLabel,
      lastSuccessfulBackupAt: SHAHRYAR_SEED_BACKUP_COMPLETED_AT,
      lastSuccessfulBackupLabel: backupStatus.lastRunLabel,
      nextScheduledBackupLabel: '2026-06-02 02:15 UTC',
      intervalHours: BACKUP_INTERVAL_HOURS,
      dataSizeLabel,
      storageScopeLabel,
      operationModeLabel: 'Existing database backup operations',
      manualExport: MANUAL_EXPORT_UNAVAILABLE,
      history: buildSeedBackupHistory({
        dataSizeLabel,
        storageScopeLabel,
      }),
    };
  }
}
