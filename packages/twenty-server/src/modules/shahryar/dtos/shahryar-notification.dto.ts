import {
  type ShahryarReportNotificationKind,
  type ShahryarReportNotificationSeverity,
} from 'src/modules/shahryar/dtos/shahryar-report.dto';

export class ShahryarNotificationDeliveryDTO {
  id: string;
  notificationId: string;
  kind: ShahryarReportNotificationKind;
  severity: ShahryarReportNotificationSeverity;
  supervisorId: string;
  supervisorName: string;
  marketId?: string;
  marketName?: string;
  deviceId: string;
  expoPushToken: string;
  title: string;
  body: string;
}

export class ShahryarNotificationDispatchResultDTO {
  attemptedCount: number;
  sentCount: number;
  failedCount: number;
  failedDeliveryIds: string[];
}
