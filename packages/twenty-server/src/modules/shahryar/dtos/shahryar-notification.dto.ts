import { IsIn, IsOptional } from 'class-validator';

import {
  type ShahryarReportNotificationKind,
  type ShahryarReportNotificationSeverity,
} from 'src/modules/shahryar/dtos/shahryar-report.dto';

export const SHAHRYAR_NOTIFICATION_DELIVERY_STATUSES = [
  'pending',
  'sent',
  'failed',
] as const;

export type ShahryarNotificationDeliveryStatus =
  (typeof SHAHRYAR_NOTIFICATION_DELIVERY_STATUSES)[number];

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
  status: ShahryarNotificationDeliveryStatus;
  attemptCount: number;
  lastAttemptAt?: string;
  failureReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class ShahryarNotificationDispatchResultDTO {
  attemptedCount: number;
  sentCount: number;
  failedCount: number;
  failedDeliveryIds: string[];
}

export class ShahryarNotificationDeliveryQueryDTO {
  @IsOptional()
  @IsIn(SHAHRYAR_NOTIFICATION_DELIVERY_STATUSES)
  status?: ShahryarNotificationDeliveryStatus;
}
