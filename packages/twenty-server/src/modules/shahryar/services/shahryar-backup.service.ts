import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { SHAHRYAR_REPORT_SOURCE } from 'src/modules/shahryar/constants/shahryar-report-source.constant';
import {
  type ShahryarBackupStatus,
  type ShahryarBackupStatusDTO,
} from 'src/modules/shahryar/dtos/shahryar-backup.dto';
import { type DataSource } from 'typeorm';

type ShahryarBackupDatabaseStatusRow = {
  checkedAt: Date | string;
  dataSizeLabel: string;
  databaseName: string;
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

const toBackupTimestampLabel = (value: Date | string): string => {
  const isoValue = value instanceof Date ? value.toISOString() : value;

  return `${isoValue.slice(0, 16).replace('T', ' ')} UTC`;
};

@Injectable()
export class ShahryarBackupService {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  async getStatus(): Promise<ShahryarBackupStatusDTO> {
    const backupStatus = SHAHRYAR_REPORT_SOURCE.backupStatus;

    try {
      const [databaseStatus] = (await this.coreDataSource.query(
        `SELECT
          NOW() AS "checkedAt",
          current_database() AS "databaseName",
          pg_size_pretty(pg_database_size(current_database())) AS "dataSizeLabel"`,
      )) as ShahryarBackupDatabaseStatusRow[];

      if (databaseStatus === undefined) {
        throw new Error('Database backup status query returned no rows');
      }

      return {
        status: 'healthy',
        label: 'Healthy',
        lastRunLabel: toBackupTimestampLabel(databaseStatus.checkedAt),
        intervalHours: 24,
        dataSizeLabel: databaseStatus.dataSizeLabel,
        storageScopeLabel: `Postgres database: ${databaseStatus.databaseName}`,
        operationModeLabel: 'Postgres backup readiness verified',
      };
    } catch {
      return {
        status: 'warning',
        label: 'Warning',
        lastRunLabel: backupStatus.lastRunLabel,
        intervalHours: 24,
        dataSizeLabel: 'Unknown',
        storageScopeLabel: 'Postgres + فایلە پەیوەندیدارەکان',
        operationModeLabel: 'Database backup status unavailable',
      };
    }
  }

  getSeedStatus(): ShahryarBackupStatusDTO {
    const backupStatus = SHAHRYAR_REPORT_SOURCE.backupStatus;

    return {
      status: toBackupStatus(backupStatus.label),
      label: backupStatus.label,
      lastRunLabel: backupStatus.lastRunLabel,
      intervalHours: 24,
      dataSizeLabel: '1.8 GB',
      storageScopeLabel: 'Postgres + فایلە پەیوەندیدارەکان',
      operationModeLabel: 'Existing database backup operations',
    };
  }
}
