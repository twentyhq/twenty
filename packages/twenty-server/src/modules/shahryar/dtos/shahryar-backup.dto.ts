export type ShahryarBackupStatus = 'healthy' | 'warning' | 'failed';

export class ShahryarBackupStatusDTO {
  status: ShahryarBackupStatus;
  label: string;
  lastRunLabel: string;
  intervalHours: number;
  dataSizeLabel: string;
  storageScopeLabel: string;
  operationModeLabel: string;
}
