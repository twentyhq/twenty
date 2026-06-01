import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import {
  type ShahryarNotificationDeliveryDTO,
  type ShahryarNotificationDispatchResultDTO,
} from 'src/modules/shahryar/dtos/shahryar-notification.dto';
import {
  type ShahryarReportNotificationDTO,
  type ShahryarReportNotificationKind,
} from 'src/modules/shahryar/dtos/shahryar-report.dto';
import { ShahryarReportService } from 'src/modules/shahryar/services/shahryar-report.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { type DataSource } from 'typeorm';

type ShahryarMobileDeviceRow = {
  id: string;
  deviceId: string;
  expoPushToken: string;
  enabledNotificationKinds?: string | null;
  registeredById?: string | null;
};

type ExpoPushTicket = {
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

    return summary.notifications.flatMap((notification) =>
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
      const failedDeliveryIds = deliveries
        .filter((delivery, index) => tickets[index]?.status !== 'ok')
        .map((delivery) => delivery.id);

      return {
        attemptedCount: deliveries.length,
        sentCount: deliveries.length - failedDeliveryIds.length,
        failedCount: failedDeliveryIds.length,
        failedDeliveryIds,
      };
    } catch {
      return {
        attemptedCount: deliveries.length,
        sentCount: 0,
        failedCount: deliveries.length,
        failedDeliveryIds: deliveries.map((delivery) => delivery.id),
      };
    }
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
    };
  }
}
