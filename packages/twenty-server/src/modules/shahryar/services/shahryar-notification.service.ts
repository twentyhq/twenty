import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { type DataSource } from 'typeorm';

import {
  type ShahryarNotificationDeliveryDTO,
  type ShahryarNotificationDeliveryStatus,
  type ShahryarNotificationDispatchResultDTO,
} from 'src/modules/shahryar/dtos/shahryar-notification.dto';
import {
  type ShahryarReportNotificationDTO,
  type ShahryarReportNotificationKind,
} from 'src/modules/shahryar/dtos/shahryar-report.dto';
import { ShahryarReportService } from 'src/modules/shahryar/services/shahryar-report.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

type ShahryarMobileDeviceRow = {
  id: string;
  deviceId: string;
  expoPushToken: string;
  enabledNotificationKinds?: string | null;
  registeredById?: string | null;
};

type ShahryarStoredNotificationDeliveryStatus = 'PENDING' | 'SENT' | 'FAILED';

type ShahryarNotificationDeliveryRow = {
  id: string;
  notificationDeliveryId: string;
  notificationId: string;
  kind: ShahryarReportNotificationKind;
  severity: ShahryarReportNotificationDTO['severity'];
  supervisorId: string;
  supervisorName: string;
  marketId?: string | null;
  marketName?: string | null;
  deviceId: string;
  expoPushToken: string;
  title: string;
  body: string;
  status?: ShahryarStoredNotificationDeliveryStatus | null;
  attemptCount?: number | null;
  lastAttemptAt?: Date | string | null;
  failureReason?: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

type ExpoPushTicket = {
  message?: string;
  status?: string;
};

type ExpoPushResponse = {
  data?: ExpoPushTicket | ExpoPushTicket[];
};

const SHAHRYAR_NOTIFICATION_TITLES: Record<
  ShahryarReportNotificationKind,
  string
> = {
  'missing-report': 'ڕاپۆرت نەهات',
  'missed-visit': 'سەردان نەکرا',
};

const SHAHRYAR_NOTIFICATION_DELIVERY_TABLE_NAME =
  '_shahryarNotificationDelivery';

const SHAHRYAR_STORED_NOTIFICATION_DELIVERY_STATUS: Record<
  ShahryarNotificationDeliveryStatus,
  ShahryarStoredNotificationDeliveryStatus
> = {
  failed: 'FAILED',
  pending: 'PENDING',
  sent: 'SENT',
};

const SHAHRYAR_NOTIFICATION_DELIVERY_STATUS: Record<
  ShahryarStoredNotificationDeliveryStatus,
  ShahryarNotificationDeliveryStatus
> = {
  FAILED: 'failed',
  PENDING: 'pending',
  SENT: 'sent',
};

const quotePostgresIdentifier = (identifier: string): string =>
  `"${identifier.replace(/"/g, '""')}"`;

const toWorkspaceTableName = ({
  tableName,
  workspaceId,
}: {
  tableName: string;
  workspaceId: string;
}): string =>
  `${quotePostgresIdentifier(
    getWorkspaceSchemaName(workspaceId),
  )}.${quotePostgresIdentifier(tableName)}`;

const parseEnabledNotificationKinds = (
  value: string | null | undefined,
): ShahryarReportNotificationKind[] =>
  value
    ?.split(',')
    .map((kind) => kind.trim())
    .filter(
      (kind): kind is ShahryarReportNotificationKind =>
        kind === 'missing-report' || kind === 'missed-visit',
    ) ?? [];

const toExpoTickets = (response: ExpoPushResponse): ExpoPushTicket[] => {
  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data === undefined ? [] : [response.data];
};

const toIsoStringOrUndefined = (
  value: Date | string | null | undefined,
): string | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  return value instanceof Date ? value.toISOString() : value;
};

const toStoredDeliveryStatus = (
  status: ShahryarNotificationDeliveryStatus,
): ShahryarStoredNotificationDeliveryStatus =>
  SHAHRYAR_STORED_NOTIFICATION_DELIVERY_STATUS[status];

const toDeliveryStatus = (
  status: ShahryarStoredNotificationDeliveryStatus | null | undefined,
): ShahryarNotificationDeliveryStatus =>
  status === undefined || status === null
    ? 'pending'
    : SHAHRYAR_NOTIFICATION_DELIVERY_STATUS[status];

@Injectable()
export class ShahryarNotificationService {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly shahryarReportService: ShahryarReportService,
  ) {}

  async getPendingDeliveries({
    authorizedSupervisorId,
    workspaceId,
  }: {
    authorizedSupervisorId?: string;
    workspaceId: string;
  }): Promise<ShahryarNotificationDeliveryDTO[]> {
    const summary = await this.shahryarReportService.getSummary(workspaceId, {
      authorizedSupervisorId,
    });

    if (summary.notifications.length === 0) {
      return [];
    }

    const supervisorIds = [
      ...new Set(
        summary.notifications.map((notification) => notification.supervisorId),
      ),
    ];
    const devicesBySupervisorId = await this.getRegisteredDevicesBySupervisorId(
      {
        supervisorIds,
        workspaceId,
      },
    ).catch(() => new Map<string, ShahryarMobileDeviceRow[]>());

    const deliveries = summary.notifications.flatMap((notification) =>
      (devicesBySupervisorId.get(notification.supervisorId) ?? [])
        .filter((device) =>
          parseEnabledNotificationKinds(
            device.enabledNotificationKinds,
          ).includes(notification.kind),
        )
        .map((device) =>
          this.toDelivery({
            device,
            notification,
          }),
        ),
    );

    if (deliveries.length === 0) {
      return [];
    }

    const deliveryRowsByDeliveryId = await this.getDeliveryRowsByDeliveryId({
      deliveryIds: deliveries.map((delivery) => delivery.id),
      workspaceId,
    });
    const pendingDeliveries = deliveries.filter((delivery) => {
      const existingDelivery = deliveryRowsByDeliveryId.get(delivery.id);
      const existingStatus = toDeliveryStatus(existingDelivery?.status);

      return existingStatus === 'pending';
    });

    await this.upsertPendingDeliveryRows({
      deliveryRowsByDeliveryId,
      deliveries: pendingDeliveries,
      workspaceId,
    });

    return pendingDeliveries.map((delivery) =>
      this.toDeliveryWithAuditFields({
        delivery,
        row: deliveryRowsByDeliveryId.get(delivery.id),
      }),
    );
  }

  async getDeliveryLog({
    authorizedSupervisorId,
    status,
    workspaceId,
  }: {
    authorizedSupervisorId?: string;
    status?: ShahryarNotificationDeliveryStatus;
    workspaceId: string;
  }): Promise<ShahryarNotificationDeliveryDTO[]> {
    await this.getPendingDeliveries({
      authorizedSupervisorId,
      workspaceId,
    });

    const rows = await this.getDeliveryLogRows({
      authorizedSupervisorId,
      status,
      workspaceId,
    });

    return rows.map((row) => this.toDeliveryDTOFromRow(row));
  }

  async dispatchPendingNotifications({
    authorizedSupervisorId,
    fetcher = globalThis.fetch,
    workspaceId,
  }: {
    authorizedSupervisorId?: string;
    fetcher?: typeof fetch;
    workspaceId: string;
  }): Promise<ShahryarNotificationDispatchResultDTO> {
    const deliveries = await this.getPendingDeliveries({
      authorizedSupervisorId,
      workspaceId,
    });

    if (deliveries.length === 0) {
      return {
        attemptedCount: 0,
        sentCount: 0,
        failedCount: 0,
        failedDeliveryIds: [],
      };
    }

    let failedDeliveryIds: string[];

    try {
      const response = await fetcher('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          deliveries.map((delivery) => ({
            to: delivery.expoPushToken,
            title: delivery.title,
            body: delivery.body,
            data: {
              deliveryId: delivery.id,
              kind: delivery.kind,
              marketId: delivery.marketId,
              notificationId: delivery.notificationId,
              supervisorId: delivery.supervisorId,
            },
            sound: 'default',
          })),
        ),
      });

      if (!response.ok) {
        throw new Error('Expo push API returned an error');
      }

      const tickets = toExpoTickets(
        (await response.json()) as ExpoPushResponse,
      );
      failedDeliveryIds = deliveries
        .filter((delivery, index) => tickets[index]?.status !== 'ok')
        .map((delivery) => delivery.id);
    } catch (error) {
      failedDeliveryIds = deliveries.map((delivery) => delivery.id);

      await this.markDeliveryRows({
        attemptedAt: new Date().toISOString(),
        deliveries,
        failedDeliveryIds,
        failureReason:
          error instanceof Error
            ? error.message
            : 'Unknown Expo push API dispatch error',
        workspaceId,
      });

      return {
        attemptedCount: deliveries.length,
        sentCount: 0,
        failedCount: deliveries.length,
        failedDeliveryIds,
      };
    }

    await this.markDeliveryRows({
      attemptedAt: new Date().toISOString(),
      deliveries,
      failedDeliveryIds,
      workspaceId,
    });

    return {
      attemptedCount: deliveries.length,
      sentCount: deliveries.length - failedDeliveryIds.length,
      failedCount: failedDeliveryIds.length,
      failedDeliveryIds,
    };
  }

  private async getRegisteredDevicesBySupervisorId({
    supervisorIds,
    workspaceId,
  }: {
    supervisorIds: string[];
    workspaceId: string;
  }): Promise<Map<string, ShahryarMobileDeviceRow[]>> {
    const rows = (await this.coreDataSource.query(
      `SELECT "id", "deviceId", "expoPushToken", "enabledNotificationKinds", "registeredById"
       FROM ${toWorkspaceTableName({
         tableName: '_shahryarMobileDevice',
         workspaceId,
       })}
       WHERE "deletedAt" IS NULL
       AND "registeredById"::text = ANY($1)
       AND COALESCE("expoPushToken", '') <> ''`,
      [supervisorIds],
    )) as ShahryarMobileDeviceRow[];

    return rows.reduce<Map<string, ShahryarMobileDeviceRow[]>>(
      (devicesBySupervisorId, row) => {
        if (row.registeredById === null || row.registeredById === undefined) {
          return devicesBySupervisorId;
        }

        devicesBySupervisorId.set(row.registeredById, [
          ...(devicesBySupervisorId.get(row.registeredById) ?? []),
          row,
        ]);

        return devicesBySupervisorId;
      },
      new Map(),
    );
  }

  private async getDeliveryRowsByDeliveryId({
    deliveryIds,
    workspaceId,
  }: {
    deliveryIds: string[];
    workspaceId: string;
  }): Promise<Map<string, ShahryarNotificationDeliveryRow>> {
    if (deliveryIds.length === 0) {
      return new Map();
    }

    const rows = (await this.coreDataSource.query(
      `SELECT
        "id",
        "notificationDeliveryId",
        "notificationId",
        "kind",
        "severity",
        "supervisorId",
        "supervisorName",
        "marketId",
        "marketName",
        "deviceId",
        "expoPushToken",
        "title",
        "body",
        "status",
        "attemptCount",
        "lastAttemptAt",
        "failureReason",
        "createdAt",
        "updatedAt"
       FROM ${toWorkspaceTableName({
         tableName: SHAHRYAR_NOTIFICATION_DELIVERY_TABLE_NAME,
         workspaceId,
       })}
       WHERE "deletedAt" IS NULL
       AND "notificationDeliveryId" = ANY($1)`,
      [deliveryIds],
    )) as ShahryarNotificationDeliveryRow[];

    return new Map(rows.map((row) => [row.notificationDeliveryId, row]));
  }

  private async getDeliveryLogRows({
    authorizedSupervisorId,
    status,
    workspaceId,
  }: {
    authorizedSupervisorId?: string;
    status?: ShahryarNotificationDeliveryStatus;
    workspaceId: string;
  }): Promise<ShahryarNotificationDeliveryRow[]> {
    const filters = ['"deletedAt" IS NULL'];
    const parameters: string[] = [];

    if (authorizedSupervisorId !== undefined) {
      parameters.push(authorizedSupervisorId);
      filters.push(`"supervisorId" = $${parameters.length}`);
    }

    if (status !== undefined) {
      parameters.push(toStoredDeliveryStatus(status));
      filters.push(`"status" = $${parameters.length}`);
    }

    return (await this.coreDataSource.query(
      `SELECT
        "id",
        "notificationDeliveryId",
        "notificationId",
        "kind",
        "severity",
        "supervisorId",
        "supervisorName",
        "marketId",
        "marketName",
        "deviceId",
        "expoPushToken",
        "title",
        "body",
        "status",
        "attemptCount",
        "lastAttemptAt",
        "failureReason",
        "createdAt",
        "updatedAt"
       FROM ${toWorkspaceTableName({
         tableName: SHAHRYAR_NOTIFICATION_DELIVERY_TABLE_NAME,
         workspaceId,
       })}
       WHERE ${filters.join(' AND ')}
       ORDER BY "updatedAt" DESC
       LIMIT 100`,
      parameters,
    )) as ShahryarNotificationDeliveryRow[];
  }

  private async upsertPendingDeliveryRows({
    deliveryRowsByDeliveryId,
    deliveries,
    workspaceId,
  }: {
    deliveryRowsByDeliveryId: Map<string, ShahryarNotificationDeliveryRow>;
    deliveries: ShahryarNotificationDeliveryDTO[];
    workspaceId: string;
  }): Promise<void> {
    const tableName = toWorkspaceTableName({
      tableName: SHAHRYAR_NOTIFICATION_DELIVERY_TABLE_NAME,
      workspaceId,
    });
    const updatedAt = new Date().toISOString();

    for (const delivery of deliveries) {
      const existingDelivery = deliveryRowsByDeliveryId.get(delivery.id);

      if (existingDelivery === undefined) {
        await this.coreDataSource.query(
          `INSERT INTO ${tableName} (
            "id",
            "name",
            "notificationDeliveryId",
            "notificationId",
            "kind",
            "severity",
            "supervisorId",
            "supervisorName",
            "marketId",
            "marketName",
            "deviceId",
            "expoPushToken",
            "title",
            "body",
            "status",
            "attemptCount",
            "lastAttemptAt",
            "failureReason",
            "updatedAt"
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NULL, NULL, $17)`,
          [
            randomUUID(),
            `${delivery.title} - ${delivery.supervisorName}`,
            delivery.id,
            delivery.notificationId,
            delivery.kind,
            delivery.severity,
            delivery.supervisorId,
            delivery.supervisorName,
            delivery.marketId ?? null,
            delivery.marketName ?? null,
            delivery.deviceId,
            delivery.expoPushToken,
            delivery.title,
            delivery.body,
            toStoredDeliveryStatus('pending'),
            0,
            updatedAt,
          ],
        );

        continue;
      }

      await this.coreDataSource.query(
        `UPDATE ${tableName}
         SET "name" = $1,
         "notificationId" = $2,
         "kind" = $3,
         "severity" = $4,
         "supervisorId" = $5,
         "supervisorName" = $6,
         "marketId" = $7,
         "marketName" = $8,
         "deviceId" = $9,
         "expoPushToken" = $10,
         "title" = $11,
         "body" = $12,
         "updatedAt" = $13
         WHERE "id" = $14`,
        [
          `${delivery.title} - ${delivery.supervisorName}`,
          delivery.notificationId,
          delivery.kind,
          delivery.severity,
          delivery.supervisorId,
          delivery.supervisorName,
          delivery.marketId ?? null,
          delivery.marketName ?? null,
          delivery.deviceId,
          delivery.expoPushToken,
          delivery.title,
          delivery.body,
          updatedAt,
          existingDelivery.id,
        ],
      );
    }
  }

  private async markDeliveryRows({
    attemptedAt,
    deliveries,
    failedDeliveryIds,
    failureReason,
    workspaceId,
  }: {
    attemptedAt: string;
    deliveries: ShahryarNotificationDeliveryDTO[];
    failedDeliveryIds: string[];
    failureReason?: string;
    workspaceId: string;
  }): Promise<void> {
    const tableName = toWorkspaceTableName({
      tableName: SHAHRYAR_NOTIFICATION_DELIVERY_TABLE_NAME,
      workspaceId,
    });
    const failedDeliveryIdSet = new Set(failedDeliveryIds);

    for (const delivery of deliveries) {
      const isFailedDelivery = failedDeliveryIdSet.has(delivery.id);
      const nextStatus = toStoredDeliveryStatus(
        isFailedDelivery ? 'failed' : 'sent',
      );

      await this.coreDataSource.query(
        `UPDATE ${tableName}
         SET "status" = $1,
         "attemptCount" = COALESCE("attemptCount", 0) + 1,
         "lastAttemptAt" = $2,
         "failureReason" = $3,
         "updatedAt" = $4
         WHERE "notificationDeliveryId" = $5`,
        [
          nextStatus,
          attemptedAt,
          isFailedDelivery
            ? (failureReason ?? 'Expo push ticket failed')
            : null,
          attemptedAt,
          delivery.id,
        ],
      );
    }
  }

  private toDelivery({
    device,
    notification,
  }: {
    device: ShahryarMobileDeviceRow;
    notification: ShahryarReportNotificationDTO;
  }): ShahryarNotificationDeliveryDTO {
    return {
      id: `${notification.id}-${device.id}`,
      notificationId: notification.id,
      kind: notification.kind,
      severity: notification.severity,
      supervisorId: notification.supervisorId,
      supervisorName: notification.supervisorName,
      marketId: notification.marketId,
      marketName: notification.marketName,
      deviceId: device.deviceId,
      expoPushToken: device.expoPushToken,
      title: SHAHRYAR_NOTIFICATION_TITLES[notification.kind],
      body: notification.message,
      status: 'pending',
      attemptCount: 0,
    };
  }

  private toDeliveryWithAuditFields({
    delivery,
    row,
  }: {
    delivery: ShahryarNotificationDeliveryDTO;
    row: ShahryarNotificationDeliveryRow | undefined;
  }): ShahryarNotificationDeliveryDTO {
    if (row === undefined) {
      return delivery;
    }

    return {
      ...delivery,
      attemptCount: row.attemptCount ?? 0,
      createdAt: toIsoStringOrUndefined(row.createdAt),
      failureReason: row.failureReason ?? undefined,
      lastAttemptAt: toIsoStringOrUndefined(row.lastAttemptAt),
      status: toDeliveryStatus(row.status),
      updatedAt: toIsoStringOrUndefined(row.updatedAt),
    };
  }

  private toDeliveryDTOFromRow(
    row: ShahryarNotificationDeliveryRow,
  ): ShahryarNotificationDeliveryDTO {
    return {
      id: row.notificationDeliveryId,
      notificationId: row.notificationId,
      kind: row.kind,
      severity: row.severity,
      supervisorId: row.supervisorId,
      supervisorName: row.supervisorName,
      ...(row.marketId !== null &&
        row.marketId !== undefined && { marketId: row.marketId }),
      ...(row.marketName !== null &&
        row.marketName !== undefined && { marketName: row.marketName }),
      deviceId: row.deviceId,
      expoPushToken: row.expoPushToken,
      title: row.title,
      body: row.body,
      status: toDeliveryStatus(row.status),
      attemptCount: row.attemptCount ?? 0,
      createdAt: toIsoStringOrUndefined(row.createdAt),
      failureReason: row.failureReason ?? undefined,
      lastAttemptAt: toIsoStringOrUndefined(row.lastAttemptAt),
      updatedAt: toIsoStringOrUndefined(row.updatedAt),
    };
  }
}
