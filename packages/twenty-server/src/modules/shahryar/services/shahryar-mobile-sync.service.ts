import { randomUUID } from 'node:crypto';
import { basename, extname } from 'node:path';

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import {
  type ShahryarGeoLocation,
  type ShahryarMobileAssignedMarket,
  type ShahryarMobileRecordKind,
  type ShahryarMobileRecordSyncChange,
  type ShahryarServerRecordSnapshot,
  type ShahryarServerVisitSnapshot,
  getShahryarMobileRecordKind,
} from 'twenty-shared/shahryar';
import { type DataSource } from 'typeorm';

import {
  type ShahryarMobileNotificationRegistrationRequestDTO,
  type ShahryarMobileNotificationRegistrationResponseDTO,
  type ShahryarMobilePhotoAssociationRequestDTO,
  type ShahryarMobilePhotoAssociationResponseDTO,
  type ShahryarMobileSyncPullResponseDTO,
  type ShahryarMobileSyncRequestDTO,
  type ShahryarMobileSyncResponseDTO,
  type ShahryarMobileSyncChangeDTO,
} from 'src/modules/shahryar/dtos/shahryar-mobile-sync.dto';
import { resolveShahryarMobileSyncChanges } from 'src/modules/shahryar/utils/resolve-shahryar-mobile-sync-changes.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

type ShahryarMobileAssignedMarketSeed = ShahryarMobileAssignedMarket & {
  assignedSupervisorId: string;
};

const SHAHRYAR_MOBILE_ASSIGNED_MARKETS: ShahryarMobileAssignedMarketSeed[] = [
  {
    id: '20202020-0101-4000-8000-000000000001',
    name: 'مارکێتی ئارام',
    ownerName: 'ئارام عەلی',
    phone: '0750 000 0001',
    address: 'هەولێر - بازاڕ',
    district: 'هەولێر',
    gpsLocation: {
      latitude: 36.191,
      longitude: 44.009,
    },
    debtStatus: 'paid',
    assignedSupervisorId: '20202020-0687-4c41-b707-ed1bfca972a7',
  },
  {
    id: '20202020-0101-4000-8000-000000000002',
    name: 'وەکیلی زاگرۆس',
    ownerName: 'سۆران قادر',
    phone: '0750 000 0002',
    address: 'هەولێر - زاگرۆس',
    district: 'هەولێر',
    gpsLocation: {
      latitude: 36.205,
      longitude: 44.023,
    },
    debtStatus: 'open',
    assignedSupervisorId: '20202020-77d5-4cb6-b60a-f4a835a85d61',
  },
  {
    id: '20202020-0101-4000-8000-000000000003',
    name: 'مارکێتی شار',
    ownerName: 'هیوا قادر',
    phone: '0750 000 0003',
    address: 'هەولێر - شار',
    district: 'هەولێر',
    gpsLocation: {
      latitude: 36.214,
      longitude: 44.015,
    },
    debtStatus: 'paid',
    assignedSupervisorId: '20202020-1553-45c6-a028-5a9064cce07f',
  },
  {
    id: '20202020-0101-4000-8000-000000000004',
    name: 'مارکێتی نوێ',
    ownerName: 'ڕێباز عەلی',
    phone: '0750 000 0004',
    address: 'سلێمانی - بازاڕی نوێ',
    district: 'سلێمانی',
    gpsLocation: {
      latitude: 35.557,
      longitude: 45.435,
    },
    debtStatus: 'partial',
    assignedSupervisorId: '20202020-463f-435b-828c-107e007a2711',
  },
];

const toAssignedMarket = (
  market: ShahryarMobileAssignedMarketSeed,
): ShahryarMobileAssignedMarket => ({
  id: market.id,
  name: market.name,
  ownerName: market.ownerName,
  phone: market.phone,
  address: market.address,
  district: market.district,
  gpsLocation: market.gpsLocation,
  debtStatus: market.debtStatus,
});

type ShahryarWorkspaceMarketRow = {
  id: string;
  name: string;
  ownerName?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  district?: string | null;
  gpsLocation?: string | null;
  paymentStatus?: string | null;
};

type ShahryarWorkspaceVisitSnapshotRow = {
  id: string;
  updatedAt: Date | string;
};

type ShahryarWorkspaceRecordSnapshotConfig = {
  ownerFieldName?: 'collectedById' | 'supervisorId';
  recordKind: ShahryarMobileRecordKind;
  tableName:
    | '_shahryarAbsence'
    | '_shahryarPayment'
    | '_shahryarSupervisorVisit'
    | '_shahryarWorkingTime';
};

type ShahryarFilesFieldItem = {
  fileId: string;
  label: string;
  extension: string;
};

type ShahryarFilesFieldItemLike = Omit<ShahryarFilesFieldItem, 'extension'> & {
  extension?: string;
};

type ShahryarWorkspacePhotoTargetType =
  ShahryarMobilePhotoAssociationRequestDTO['targetType'];

type ShahryarWorkspacePhotoTargetConfig = {
  fieldName: 'photos' | 'shopPhotos';
  maxNumberOfValues: number;
  ownerFieldName: 'assignedSupervisorId' | 'supervisorId';
  tableName: '_shahryarMarket' | '_shahryarSupervisorVisit';
};

type ShahryarWorkspacePhotoTargetRow = {
  files: unknown;
  ownerId: string | null;
};

type ShahryarWorkspaceFileRow = {
  path: string;
};

type ShahryarWorkspaceMobileDeviceRow = {
  id: string;
};

type ShahryarMobileNotificationKind =
  ShahryarMobileNotificationRegistrationResponseDTO['enabledNotificationKinds'][number];

const SHAHRYAR_MOBILE_DEVICE_PLATFORM_OPTION_VALUE: Record<
  ShahryarMobileNotificationRegistrationRequestDTO['platform'],
  'ANDROID' | 'IOS'
> = {
  android: 'ANDROID',
  ios: 'IOS',
};

const SHAHRYAR_WORKSPACE_PHOTO_TARGET_CONFIGS: Record<
  ShahryarWorkspacePhotoTargetType,
  ShahryarWorkspacePhotoTargetConfig
> = {
  market: {
    fieldName: 'shopPhotos',
    maxNumberOfValues: 4,
    ownerFieldName: 'assignedSupervisorId',
    tableName: '_shahryarMarket',
  },
  visit: {
    fieldName: 'photos',
    maxNumberOfValues: 8,
    ownerFieldName: 'supervisorId',
    tableName: '_shahryarSupervisorVisit',
  },
};

const SHAHRYAR_MOBILE_DEVICE_TABLE_NAME = '_shahryarMobileDevice';

const SHAHRYAR_WORKSPACE_RECORD_SNAPSHOT_CONFIGS: ShahryarWorkspaceRecordSnapshotConfig[] =
  [
    {
      ownerFieldName: 'supervisorId',
      recordKind: 'visit',
      tableName: '_shahryarSupervisorVisit',
    },
    {
      ownerFieldName: 'supervisorId',
      recordKind: 'working-time',
      tableName: '_shahryarWorkingTime',
    },
    {
      ownerFieldName: 'collectedById',
      recordKind: 'payment',
      tableName: '_shahryarPayment',
    },
    {
      ownerFieldName: 'supervisorId',
      recordKind: 'absence',
      tableName: '_shahryarAbsence',
    },
  ];

const SHAHRYAR_ENABLED_NOTIFICATION_KINDS: ShahryarMobileNotificationKind[] = [
  'missing-report',
  'missed-visit',
];

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

const parseGpsLocation = (
  gpsLocation: string | null | undefined,
): ShahryarMobileAssignedMarket['gpsLocation'] => {
  const [latitudeValue, longitudeValue] = gpsLocation
    ?.split(',')
    .map((coordinate) => Number(coordinate.trim())) ?? [undefined, undefined];
  const latitude =
    latitudeValue !== undefined && Number.isFinite(latitudeValue)
      ? latitudeValue
      : 0;
  const longitude =
    longitudeValue !== undefined && Number.isFinite(longitudeValue)
      ? longitudeValue
      : 0;

  return {
    latitude,
    longitude,
  };
};

const toMobileDebtStatus = (
  paymentStatus: string | null | undefined,
): ShahryarMobileAssignedMarket['debtStatus'] => {
  if (paymentStatus === 'PAID') {
    return 'paid';
  }

  if (paymentStatus === 'PARTIAL') {
    return 'partial';
  }

  return 'open';
};

const toGpsLocationValue = (gpsLocation: ShahryarGeoLocation): string =>
  `${gpsLocation.latitude}, ${gpsLocation.longitude}`;

const toServerRecordSnapshotsFromVisits = (
  serverVisits: ShahryarServerVisitSnapshot[],
): ShahryarServerRecordSnapshot[] =>
  serverVisits.map((serverVisit) => ({
    id: serverVisit.id,
    recordKind: 'visit',
    updatedAt: serverVisit.updatedAt,
  }));

const toServerVisitSnapshots = (
  serverRecords: ShahryarServerRecordSnapshot[],
): ShahryarServerVisitSnapshot[] =>
  serverRecords
    .filter((serverRecord) => serverRecord.recordKind === 'visit')
    .map((serverRecord) => ({
      id: serverRecord.id,
      updatedAt: serverRecord.updatedAt,
    }));

const toMobileRecordSyncChange = (
  change: ShahryarMobileSyncChangeDTO,
): ShahryarMobileRecordSyncChange => change as ShahryarMobileRecordSyncChange;

const requireString = (
  value: string | undefined,
  fieldName: string,
): string => {
  if (value === undefined || value.trim().length === 0) {
    throw new BadRequestException(`Missing mobile sync field: ${fieldName}`);
  }

  return value;
};

const requireNumber = (
  value: number | undefined,
  fieldName: string,
): number => {
  if (value === undefined || !Number.isFinite(value)) {
    throw new BadRequestException(`Missing mobile sync field: ${fieldName}`);
  }

  return value;
};

const requireGpsLocation = (
  value: ShahryarGeoLocation | undefined,
  fieldName: string,
): ShahryarGeoLocation => {
  if (value === undefined) {
    throw new BadRequestException(`Missing mobile sync field: ${fieldName}`);
  }

  return value;
};

const isFilesFieldItemLike = (
  value: unknown,
): value is ShahryarFilesFieldItemLike =>
  value !== null &&
  typeof value === 'object' &&
  'fileId' in value &&
  typeof value.fileId === 'string' &&
  'label' in value &&
  typeof value.label === 'string';

const toFilesFieldItems = (value: unknown): ShahryarFilesFieldItem[] => {
  const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue.filter(isFilesFieldItemLike).map((item) => ({
    fileId: item.fileId,
    label: item.label,
    extension: item.extension ?? '',
  }));
};

const mergePhotoFileItem = ({
  existingFiles,
  fileItem,
  maxNumberOfValues,
}: {
  existingFiles: ShahryarFilesFieldItem[];
  fileItem: ShahryarFilesFieldItem;
  maxNumberOfValues: number;
}): ShahryarFilesFieldItem[] => {
  const existingFileIndex = existingFiles.findIndex(
    (existingFile) => existingFile.fileId === fileItem.fileId,
  );

  if (existingFileIndex >= 0) {
    return existingFiles.map((existingFile, index) =>
      index === existingFileIndex ? fileItem : existingFile,
    );
  }

  if (existingFiles.length >= maxNumberOfValues) {
    throw new BadRequestException(
      `Cannot associate more than ${maxNumberOfValues} photos with this record`,
    );
  }

  return [...existingFiles, fileItem];
};

const getPhotoAssociationLabel = ({
  filePath,
  localPhotoId,
}: {
  filePath: string;
  localPhotoId: string;
}): string => {
  const localPhotoPath = localPhotoId.split('?')[0] ?? '';
  const localPhotoBasename = localPhotoPath.split('/').pop()?.trim();

  if (localPhotoBasename !== undefined && localPhotoBasename.length > 0) {
    return localPhotoBasename;
  }

  return basename(filePath);
};

@Injectable()
export class ShahryarMobileSyncService {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  async resolveSyncRequest({
    authorizedSupervisorId,
    request,
    serverRecords,
    serverVisits = [],
    syncedAt = new Date().toISOString(),
    workspaceId,
  }: {
    authorizedSupervisorId?: string;
    request: ShahryarMobileSyncRequestDTO;
    serverRecords?: ShahryarServerRecordSnapshot[];
    serverVisits?: ShahryarServerVisitSnapshot[];
    syncedAt?: string;
    workspaceId?: string;
  }): Promise<ShahryarMobileSyncResponseDTO> {
    const changes = this.assignServerIdsToNewRecords(request.changes);
    const workspaceServerRecords =
      workspaceId === undefined
        ? (serverRecords ?? toServerRecordSnapshotsFromVisits(serverVisits))
        : await this.getWorkspaceRecordSnapshots({
            authorizedSupervisorId,
            workspaceId,
          });
    const response = resolveShahryarMobileSyncChanges({
      authorizedSupervisorId,
      changes: changes.map(toMobileRecordSyncChange),
      deviceId: request.deviceId,
      serverRecords: workspaceServerRecords,
      syncedAt,
    });

    if (workspaceId !== undefined) {
      await this.persistAcceptedSyncChanges({
        changes,
        response,
        syncedAt,
        workspaceId,
      });
    }

    return response;
  }

  async getPullResponse({
    assignedSupervisorId,
    serverVisits = [],
    syncedAt = new Date().toISOString(),
    workspaceId,
  }: {
    assignedSupervisorId?: string;
    serverVisits?: ShahryarServerVisitSnapshot[];
    syncedAt?: string;
    workspaceId?: string;
  } = {}): Promise<ShahryarMobileSyncPullResponseDTO> {
    const workspaceData =
      workspaceId === undefined
        ? undefined
        : await this.getWorkspacePullData({
            assignedSupervisorId,
            workspaceId,
          }).catch(() => undefined);
    const assignedMarkets =
      workspaceData?.assignedMarkets ??
      SHAHRYAR_MOBILE_ASSIGNED_MARKETS.filter(
        (market) =>
          assignedSupervisorId === undefined ||
          market.assignedSupervisorId === assignedSupervisorId,
      ).map(toAssignedMarket);

    return {
      serverTime: syncedAt,
      nextPullCursor: syncedAt,
      currentSupervisorId: assignedSupervisorId,
      assignedMarkets,
      serverRecords:
        workspaceData?.serverRecords ??
        toServerRecordSnapshotsFromVisits(serverVisits),
      serverVisits:
        workspaceData?.serverVisits ??
        toServerVisitSnapshots(toServerRecordSnapshotsFromVisits(serverVisits)),
    };
  }

  async associatePhoto({
    authorizedSupervisorId,
    request,
    associatedAt = new Date().toISOString(),
    workspaceId,
  }: {
    authorizedSupervisorId?: string;
    request: ShahryarMobilePhotoAssociationRequestDTO;
    associatedAt?: string;
    workspaceId?: string;
  }): Promise<ShahryarMobilePhotoAssociationResponseDTO> {
    if (workspaceId !== undefined) {
      await this.persistPhotoAssociation({
        authorizedSupervisorId,
        associatedAt,
        request,
        workspaceId,
      });
    }

    return {
      localPhotoId: request.localPhotoId,
      fileId: request.fileId,
      targetType: request.targetType,
      targetId: request.targetId,
      associatedAt,
    };
  }

  async registerNotifications({
    request,
    registeredAt = new Date().toISOString(),
    workspaceId,
    workspaceMemberId,
  }: {
    request: ShahryarMobileNotificationRegistrationRequestDTO;
    registeredAt?: string;
    workspaceId?: string;
    workspaceMemberId?: string;
  }): Promise<ShahryarMobileNotificationRegistrationResponseDTO> {
    if (workspaceId !== undefined) {
      await this.persistNotificationRegistration({
        registeredAt,
        request,
        workspaceId,
        workspaceMemberId,
      });
    }

    return {
      deviceId: request.deviceId,
      registeredAt,
      enabledNotificationKinds: [...SHAHRYAR_ENABLED_NOTIFICATION_KINDS],
    };
  }

  private assignServerIdsToNewRecords(
    changes: ShahryarMobileSyncChangeDTO[],
  ): ShahryarMobileSyncChangeDTO[] {
    return changes.map((change) =>
      change.operation === 'create' && change.serverId === undefined
        ? {
            ...change,
            serverId: randomUUID(),
          }
        : change,
    );
  }

  private async getWorkspacePullData({
    assignedSupervisorId,
    workspaceId,
  }: {
    assignedSupervisorId?: string;
    workspaceId: string;
  }): Promise<{
    assignedMarkets: ShahryarMobileAssignedMarket[];
    serverRecords: ShahryarServerRecordSnapshot[];
    serverVisits: ShahryarServerVisitSnapshot[];
  }> {
    const assignedMarkets = await this.getWorkspaceAssignedMarkets({
      assignedSupervisorId,
      workspaceId,
    });
    const serverRecords = await this.getWorkspaceRecordSnapshots({
      authorizedSupervisorId: assignedSupervisorId,
      workspaceId,
    });

    return {
      assignedMarkets,
      serverRecords,
      serverVisits: toServerVisitSnapshots(serverRecords),
    };
  }

  private async getWorkspaceAssignedMarkets({
    assignedSupervisorId,
    workspaceId,
  }: {
    assignedSupervisorId?: string;
    workspaceId: string;
  }): Promise<ShahryarMobileAssignedMarket[]> {
    const tableName = toWorkspaceTableName({
      tableName: '_shahryarMarket',
      workspaceId,
    });
    const supervisorFilter =
      assignedSupervisorId === undefined
        ? ''
        : 'AND "assignedSupervisorId" = $1';
    const rows = (await this.coreDataSource.query(
      `SELECT "id", "name", "ownerName", "phoneNumber", "marketAddress" AS "address", "district", "gpsLocation", "paymentStatus"
       FROM ${tableName}
       WHERE "isActiveMarket" IS NOT FALSE ${supervisorFilter}
       ORDER BY "name" ASC`,
      assignedSupervisorId === undefined ? [] : [assignedSupervisorId],
    )) as ShahryarWorkspaceMarketRow[];

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      ownerName: row.ownerName ?? '',
      phone: row.phoneNumber ?? '',
      address: row.address ?? '',
      district: row.district ?? '',
      gpsLocation: parseGpsLocation(row.gpsLocation),
      debtStatus: toMobileDebtStatus(row.paymentStatus),
    }));
  }

  private async getWorkspaceRecordSnapshots({
    authorizedSupervisorId,
    workspaceId,
  }: {
    authorizedSupervisorId?: string;
    workspaceId: string;
  }): Promise<ShahryarServerRecordSnapshot[]> {
    const snapshots: ShahryarServerRecordSnapshot[] = [];

    for (const config of SHAHRYAR_WORKSPACE_RECORD_SNAPSHOT_CONFIGS) {
      const tableName = toWorkspaceTableName({
        tableName: config.tableName,
        workspaceId,
      });
      const supervisorFilter =
        authorizedSupervisorId === undefined ||
        config.ownerFieldName === undefined
          ? ''
          : `WHERE "${config.ownerFieldName}" = $1`;
      const rows = (await this.coreDataSource.query(
        `SELECT "id", "updatedAt"
         FROM ${tableName}
         ${supervisorFilter}
         ORDER BY "updatedAt" DESC`,
        authorizedSupervisorId === undefined ||
          config.ownerFieldName === undefined
          ? []
          : [authorizedSupervisorId],
      )) as ShahryarWorkspaceVisitSnapshotRow[];

      snapshots.push(
        ...rows.map((row) => ({
          id: row.id,
          recordKind: config.recordKind,
          updatedAt:
            row.updatedAt instanceof Date
              ? row.updatedAt.toISOString()
              : row.updatedAt,
        })),
      );
    }

    return snapshots;
  }

  private async persistAcceptedSyncChanges({
    changes,
    response,
    syncedAt,
    workspaceId,
  }: {
    changes: ShahryarMobileSyncChangeDTO[];
    response: ShahryarMobileSyncResponseDTO;
    syncedAt: string;
    workspaceId: string;
  }): Promise<void> {
    const changeByLocalId = new Map(
      changes.map((change) => [change.localId, change]),
    );

    for (const acceptedChange of response.acceptedChanges) {
      const change = changeByLocalId.get(acceptedChange.localId);

      if (change === undefined || acceptedChange.serverId === undefined) {
        continue;
      }

      const recordKind = getShahryarMobileRecordKind(
        toMobileRecordSyncChange(change),
      );

      if (recordKind === 'visit') {
        await this.persistAcceptedVisitChange({
          change,
          serverId: acceptedChange.serverId,
          syncedAt,
          workspaceId,
        });

        continue;
      }

      if (recordKind === 'working-time') {
        await this.persistAcceptedWorkingTimeChange({
          change,
          serverId: acceptedChange.serverId,
          syncedAt,
          workspaceId,
        });

        continue;
      }

      if (recordKind === 'payment') {
        await this.persistAcceptedPaymentChange({
          change,
          serverId: acceptedChange.serverId,
          syncedAt,
          workspaceId,
        });

        continue;
      }

      await this.persistAcceptedAbsenceChange({
        change,
        serverId: acceptedChange.serverId,
        syncedAt,
        workspaceId,
      });
    }
  }

  private async persistAcceptedVisitChange({
    change,
    serverId,
    syncedAt,
    workspaceId,
  }: {
    change: ShahryarMobileSyncChangeDTO;
    serverId: string;
    syncedAt: string;
    workspaceId: string;
  }): Promise<void> {
    const tableName = toWorkspaceTableName({
      tableName: '_shahryarSupervisorVisit',
      workspaceId,
    });
    const checkInAt = requireString(change.checkInAt, 'checkInAt');
    const report = requireString(change.report, 'report');

    await this.coreDataSource.query(
      `INSERT INTO ${tableName} (
        "id",
        "name",
        "marketId",
        "supervisorId",
        "checkInAt",
        "checkOutAt",
        "gpsLocation",
        "soldCartons",
        "requestedCartons",
        "issue",
        "decisionMaker",
        "requestDetails",
        "report",
        "notes",
        "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, NULL, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT ("id") DO UPDATE SET
        "name" = EXCLUDED."name",
        "marketId" = EXCLUDED."marketId",
        "supervisorId" = EXCLUDED."supervisorId",
        "checkInAt" = EXCLUDED."checkInAt",
        "gpsLocation" = EXCLUDED."gpsLocation",
        "soldCartons" = EXCLUDED."soldCartons",
        "requestedCartons" = EXCLUDED."requestedCartons",
        "issue" = EXCLUDED."issue",
        "decisionMaker" = EXCLUDED."decisionMaker",
        "requestDetails" = EXCLUDED."requestDetails",
        "report" = EXCLUDED."report",
        "notes" = EXCLUDED."notes",
        "updatedAt" = EXCLUDED."updatedAt"`,
      [
        serverId,
        `Mobile visit ${checkInAt}`,
        requireString(change.assignedMarketId, 'assignedMarketId'),
        requireString(change.supervisorId, 'supervisorId'),
        checkInAt,
        toGpsLocationValue(
          requireGpsLocation(change.gpsLocation, 'gpsLocation'),
        ),
        requireNumber(change.soldCartons, 'soldCartons'),
        requireNumber(change.requestedCartons, 'requestedCartons'),
        change.issue ?? '',
        change.decisionMaker ?? '',
        change.requestDetails ?? '',
        report,
        report,
        syncedAt,
      ],
    );
  }

  private async persistAcceptedWorkingTimeChange({
    change,
    serverId,
    syncedAt,
    workspaceId,
  }: {
    change: ShahryarMobileSyncChangeDTO;
    serverId: string;
    syncedAt: string;
    workspaceId: string;
  }): Promise<void> {
    const tableName = toWorkspaceTableName({
      tableName: '_shahryarWorkingTime',
      workspaceId,
    });
    const workDate = requireString(change.workDate, 'workDate');

    await this.coreDataSource.query(
      `INSERT INTO ${tableName} (
        "id",
        "name",
        "supervisorId",
        "workDate",
        "checkInAt",
        "checkOutAt",
        "gpsLocation",
        "totalMinutes",
        "status",
        "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT ("id") DO UPDATE SET
        "name" = EXCLUDED."name",
        "supervisorId" = EXCLUDED."supervisorId",
        "workDate" = EXCLUDED."workDate",
        "checkInAt" = EXCLUDED."checkInAt",
        "checkOutAt" = EXCLUDED."checkOutAt",
        "gpsLocation" = EXCLUDED."gpsLocation",
        "totalMinutes" = EXCLUDED."totalMinutes",
        "status" = EXCLUDED."status",
        "updatedAt" = EXCLUDED."updatedAt"`,
      [
        serverId,
        `Mobile working time ${workDate}`,
        requireString(change.supervisorId, 'supervisorId'),
        workDate,
        requireString(change.checkInAt, 'checkInAt'),
        change.checkOutAt ?? null,
        toGpsLocationValue(
          requireGpsLocation(change.gpsLocation, 'gpsLocation'),
        ),
        requireNumber(change.totalMinutes, 'totalMinutes'),
        requireString(change.status, 'status'),
        syncedAt,
      ],
    );
  }

  private async persistAcceptedPaymentChange({
    change,
    serverId,
    syncedAt,
    workspaceId,
  }: {
    change: ShahryarMobileSyncChangeDTO;
    serverId: string;
    syncedAt: string;
    workspaceId: string;
  }): Promise<void> {
    const tableName = toWorkspaceTableName({
      tableName: '_shahryarPayment',
      workspaceId,
    });
    const paidAt = change.paidAt ?? null;
    const dueDate = change.dueDate ?? paidAt ?? syncedAt.slice(0, 10);

    await this.coreDataSource.query(
      `INSERT INTO ${tableName} (
        "id",
        "name",
        "marketId",
        "collectedById",
        "amount",
        "dueDate",
        "paidAt",
        "status",
        "notes",
        "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT ("id") DO UPDATE SET
        "name" = EXCLUDED."name",
        "marketId" = EXCLUDED."marketId",
        "collectedById" = EXCLUDED."collectedById",
        "amount" = EXCLUDED."amount",
        "dueDate" = EXCLUDED."dueDate",
        "paidAt" = EXCLUDED."paidAt",
        "status" = EXCLUDED."status",
        "notes" = EXCLUDED."notes",
        "updatedAt" = EXCLUDED."updatedAt"`,
      [
        serverId,
        `Mobile payment ${dueDate}`,
        requireString(change.marketId, 'marketId'),
        requireString(change.collectedById, 'collectedById'),
        requireNumber(change.amount, 'amount'),
        dueDate,
        paidAt,
        requireString(change.status, 'status'),
        change.notes ?? '',
        syncedAt,
      ],
    );
  }

  private async persistAcceptedAbsenceChange({
    change,
    serverId,
    syncedAt,
    workspaceId,
  }: {
    change: ShahryarMobileSyncChangeDTO;
    serverId: string;
    syncedAt: string;
    workspaceId: string;
  }): Promise<void> {
    const tableName = toWorkspaceTableName({
      tableName: '_shahryarAbsence',
      workspaceId,
    });
    const absenceDate = requireString(change.absenceDate, 'absenceDate');

    await this.coreDataSource.query(
      `INSERT INTO ${tableName} (
        "id",
        "name",
        "supervisorId",
        "absenceDate",
        "workingTime",
        "gpsLocation",
        "reason",
        "notes",
        "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT ("id") DO UPDATE SET
        "name" = EXCLUDED."name",
        "supervisorId" = EXCLUDED."supervisorId",
        "absenceDate" = EXCLUDED."absenceDate",
        "workingTime" = EXCLUDED."workingTime",
        "gpsLocation" = EXCLUDED."gpsLocation",
        "reason" = EXCLUDED."reason",
        "notes" = EXCLUDED."notes",
        "updatedAt" = EXCLUDED."updatedAt"`,
      [
        serverId,
        `Mobile absence ${absenceDate}`,
        requireString(change.supervisorId, 'supervisorId'),
        absenceDate,
        change.workingTime ?? '',
        toGpsLocationValue(
          requireGpsLocation(change.gpsLocation, 'gpsLocation'),
        ),
        requireString(change.reason, 'reason'),
        change.notes ?? '',
        syncedAt,
      ],
    );
  }

  private async persistPhotoAssociation({
    authorizedSupervisorId,
    associatedAt,
    request,
    workspaceId,
  }: {
    authorizedSupervisorId?: string;
    associatedAt: string;
    request: ShahryarMobilePhotoAssociationRequestDTO;
    workspaceId: string;
  }): Promise<void> {
    const targetConfig =
      SHAHRYAR_WORKSPACE_PHOTO_TARGET_CONFIGS[request.targetType];
    const targetTableName = toWorkspaceTableName({
      tableName: targetConfig.tableName,
      workspaceId,
    });
    const fieldName = quotePostgresIdentifier(targetConfig.fieldName);
    const ownerFieldName = quotePostgresIdentifier(targetConfig.ownerFieldName);
    const [file] = (await this.coreDataSource.query(
      `SELECT "path"
       FROM "core"."file"
       WHERE "id" = $1
       AND "workspaceId" = $2
       AND "deletedAt" IS NULL`,
      [request.fileId, workspaceId],
    )) as ShahryarWorkspaceFileRow[];

    if (file === undefined) {
      throw new NotFoundException('Uploaded photo file was not found');
    }

    const [targetRow] = (await this.coreDataSource.query(
      `SELECT ${fieldName} AS "files", ${ownerFieldName} AS "ownerId"
       FROM ${targetTableName}
       WHERE "id" = $1
       AND "deletedAt" IS NULL`,
      [request.targetId],
    )) as ShahryarWorkspacePhotoTargetRow[];

    if (targetRow === undefined) {
      throw new NotFoundException('Photo association target was not found');
    }

    if (
      authorizedSupervisorId !== undefined &&
      targetRow.ownerId !== authorizedSupervisorId
    ) {
      throw new ForbiddenException(
        'Supervisors can only associate photos with their assigned records.',
      );
    }

    const existingFiles = toFilesFieldItems(targetRow.files);
    const nextFiles = mergePhotoFileItem({
      existingFiles,
      fileItem: {
        fileId: request.fileId,
        label: getPhotoAssociationLabel({
          filePath: file.path,
          localPhotoId: request.localPhotoId,
        }),
        extension: extname(file.path),
      },
      maxNumberOfValues: targetConfig.maxNumberOfValues,
    });

    await this.coreDataSource.query(
      `UPDATE ${targetTableName}
       SET ${fieldName} = $1::jsonb,
       "updatedAt" = $2
       WHERE "id" = $3`,
      [JSON.stringify(nextFiles), associatedAt, request.targetId],
    );

    await this.coreDataSource.query(
      `UPDATE "core"."file"
       SET "settings" = COALESCE("settings", '{}'::jsonb) || $1::jsonb,
       "updatedAt" = $2
       WHERE "id" = $3
       AND "workspaceId" = $4`,
      [
        JSON.stringify({
          isTemporaryFile: false,
          toDelete: false,
        }),
        associatedAt,
        request.fileId,
        workspaceId,
      ],
    );
  }

  private async persistNotificationRegistration({
    registeredAt,
    request,
    workspaceId,
    workspaceMemberId,
  }: {
    registeredAt: string;
    request: ShahryarMobileNotificationRegistrationRequestDTO;
    workspaceId: string;
    workspaceMemberId?: string;
  }): Promise<void> {
    const tableName = toWorkspaceTableName({
      tableName: SHAHRYAR_MOBILE_DEVICE_TABLE_NAME,
      workspaceId,
    });
    const platformOptionValue =
      SHAHRYAR_MOBILE_DEVICE_PLATFORM_OPTION_VALUE[request.platform];
    const [existingDevice] = (await this.coreDataSource.query(
      `SELECT "id"
       FROM ${tableName}
       WHERE "deviceId" = $1
       AND "deletedAt" IS NULL
       LIMIT 1`,
      [request.deviceId],
    )) as ShahryarWorkspaceMobileDeviceRow[];

    if (existingDevice === undefined) {
      await this.coreDataSource.query(
        `INSERT INTO ${tableName} (
          "id",
          "name",
          "deviceId",
          "expoPushToken",
          "platform",
          "enabledNotificationKinds",
          "lastRegisteredAt",
          "registeredById",
          "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          randomUUID(),
          `${request.platform} device ${request.deviceId}`,
          request.deviceId,
          request.expoPushToken,
          platformOptionValue,
          SHAHRYAR_ENABLED_NOTIFICATION_KINDS.join(','),
          registeredAt,
          workspaceMemberId ?? null,
          registeredAt,
        ],
      );

      return;
    }

    await this.coreDataSource.query(
      `UPDATE ${tableName}
       SET "name" = $1,
       "expoPushToken" = $2,
       "platform" = $3,
       "enabledNotificationKinds" = $4,
       "lastRegisteredAt" = $5,
       "registeredById" = $6,
       "updatedAt" = $7
       WHERE "id" = $8`,
      [
        `${request.platform} device ${request.deviceId}`,
        request.expoPushToken,
        platformOptionValue,
        SHAHRYAR_ENABLED_NOTIFICATION_KINDS.join(','),
        registeredAt,
        workspaceMemberId ?? null,
        registeredAt,
        existingDevice.id,
      ],
    );
  }
}
