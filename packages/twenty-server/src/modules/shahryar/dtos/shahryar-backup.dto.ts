export type ShahryarBackupStatus = 'healthy' | 'warning' | 'failed';

export class ShahryarBackupHistoryEntryDTO {
  id: string;
  status: ShahryarBackupStatus;
  label: string;
  completedAt: string;
  completedAtLabel: string;
  dataSizeLabel: string;
  storageScopeLabel: string;
  failureReason?: string;
}

export class ShahryarBackupManualExportDTO {
  isAvailable: boolean;
  label: string;
  downloadUrl?: string;
}

export class ShahryarBackupStatusDTO {
  status: ShahryarBackupStatus;
  label: string;
  lastRunLabel: string;
  lastSuccessfulBackupAt?: string;
  lastSuccessfulBackupLabel: string;
  nextScheduledBackupAt?: string;
  nextScheduledBackupLabel: string;
  intervalHours: number;
  dataSizeLabel: string;
  storageScopeLabel: string;
  operationModeLabel: string;
  failureReason?: string;
  manualExport: ShahryarBackupManualExportDTO;
  history: ShahryarBackupHistoryEntryDTO[];
}
