export type ShahryarVisitSyncOperation = 'create' | 'update';

export type ShahryarMobileRecordKind =
  | 'visit'
  | 'working-time'
  | 'payment'
  | 'absence';

export type ShahryarMobileSyncConflictReason = 'server-newer';

export type ShahryarMobileSyncRejectedReason =
  | 'invalid-carton-count'
  | 'invalid-amount'
  | 'invalid-duration'
  | 'invalid-timestamp'
  | 'missing-server-id'
  | 'missing-required-field'
  | 'unauthorized-supervisor';

export type ShahryarGeoLocation = {
  latitude: number;
  longitude: number;
};

export const SHAHRYAR_SUPERVISOR_VISIT_PHOTOS_FIELD_METADATA_UNIVERSAL_IDENTIFIER =
  '20202020-147c-4d5f-9c13-000000000001';

export type ShahryarMobileVisitDraft = {
  recordKind?: 'visit';
  localId: string;
  serverId?: string;
  assignedMarketId: string;
  supervisorId: string;
  checkInAt: string;
  gpsLocation: ShahryarGeoLocation;
  photoLocalUris: string[];
  photoFileIds: string[];
  soldCartons: number;
  requestedCartons: number;
  issue: string;
  decisionMaker: string;
  requestDetails: string;
  report: string;
  updatedAt: string;
};

export type ShahryarMobileWorkingTimeDraft = {
  recordKind: 'working-time';
  localId: string;
  serverId?: string;
  supervisorId: string;
  workDate: string;
  checkInAt: string;
  checkOutAt?: string;
  gpsLocation: ShahryarGeoLocation;
  totalMinutes: number;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
  updatedAt: string;
};

export type ShahryarMobilePaymentDraft = {
  recordKind: 'payment';
  localId: string;
  serverId?: string;
  marketId: string;
  collectedById: string;
  amount: number;
  dueDate?: string;
  paidAt?: string;
  status: 'CLOSED' | 'OPEN' | 'PARTIAL';
  notes?: string;
  updatedAt: string;
};

export type ShahryarMobileAbsenceDraft = {
  recordKind: 'absence';
  localId: string;
  serverId?: string;
  supervisorId: string;
  absenceDate: string;
  workingTime?: string;
  gpsLocation: ShahryarGeoLocation;
  reason: 'ABSENT' | 'LATE' | 'NO_WORK';
  notes?: string;
  updatedAt: string;
};

export type ShahryarMobileRecordDraft =
  | ShahryarMobileVisitDraft
  | ShahryarMobileWorkingTimeDraft
  | ShahryarMobilePaymentDraft
  | ShahryarMobileAbsenceDraft;

export type ShahryarMobileSyncQueueItemBase<
  TRecordKind extends ShahryarMobileRecordKind,
  TDraft extends ShahryarMobileRecordDraft,
> = {
  localId: string;
  recordKind: TRecordKind;
  status: 'pending' | 'synced' | 'conflict' | 'rejected' | 'discarded';
  draft: TDraft;
  createdAt: string;
  updatedAt: string;
  lastSyncedAt?: string;
  conflict?: ShahryarMobileSyncConflict;
  rejection?: ShahryarMobileSyncRejectedChange;
};

export type ShahryarMobileVisitSyncQueueItem = ShahryarMobileSyncQueueItemBase<
  'visit',
  ShahryarMobileVisitDraft
>;

export type ShahryarMobileWorkingTimeSyncQueueItem =
  ShahryarMobileSyncQueueItemBase<
    'working-time',
    ShahryarMobileWorkingTimeDraft
  >;

export type ShahryarMobilePaymentSyncQueueItem =
  ShahryarMobileSyncQueueItemBase<'payment', ShahryarMobilePaymentDraft>;

export type ShahryarMobileAbsenceSyncQueueItem =
  ShahryarMobileSyncQueueItemBase<'absence', ShahryarMobileAbsenceDraft>;

export type ShahryarMobileSyncQueueItem =
  | ShahryarMobileVisitSyncQueueItem
  | ShahryarMobileWorkingTimeSyncQueueItem
  | ShahryarMobilePaymentSyncQueueItem
  | ShahryarMobileAbsenceSyncQueueItem;

export type ShahryarServerRecordSnapshot = {
  id: string;
  recordKind: ShahryarMobileRecordKind;
  updatedAt: string;
};

export type ShahryarServerVisitSnapshot = Omit<
  ShahryarServerRecordSnapshot,
  'recordKind'
> & {
  recordKind?: 'visit';
};

export type ShahryarMobileSyncConflict = {
  localId: string;
  serverId: string;
  recordKind: ShahryarMobileRecordKind;
  reason: ShahryarMobileSyncConflictReason;
  localUpdatedAt: string;
  serverUpdatedAt: string;
};

export type ShahryarSyncResolution = {
  itemsToPush: ShahryarMobileSyncQueueItem[];
  itemsToKeepLocal: ShahryarMobileSyncQueueItem[];
  conflicts: ShahryarMobileSyncConflict[];
};

export type ShahryarMobileVisitSyncChange = {
  recordKind?: 'visit';
  localId: string;
  serverId?: string;
  operation: ShahryarVisitSyncOperation;
  assignedMarketId: string;
  supervisorId: string;
  checkInAt: string;
  gpsLocation: ShahryarGeoLocation;
  photoFileIds: string[];
  soldCartons: number;
  requestedCartons: number;
  issue?: string;
  decisionMaker?: string;
  requestDetails?: string;
  report: string;
  baseServerUpdatedAt?: string;
  clientUpdatedAt: string;
};

export type ShahryarMobileWorkingTimeSyncChange = {
  recordKind: 'working-time';
  localId: string;
  serverId?: string;
  operation: ShahryarVisitSyncOperation;
  supervisorId: string;
  workDate: string;
  checkInAt: string;
  checkOutAt?: string;
  gpsLocation: ShahryarGeoLocation;
  totalMinutes: number;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
  baseServerUpdatedAt?: string;
  clientUpdatedAt: string;
};

export type ShahryarMobilePaymentSyncChange = {
  recordKind: 'payment';
  localId: string;
  serverId?: string;
  operation: ShahryarVisitSyncOperation;
  marketId: string;
  collectedById: string;
  amount: number;
  dueDate?: string;
  paidAt?: string;
  status: 'CLOSED' | 'OPEN' | 'PARTIAL';
  notes?: string;
  baseServerUpdatedAt?: string;
  clientUpdatedAt: string;
};

export type ShahryarMobileAbsenceSyncChange = {
  recordKind: 'absence';
  localId: string;
  serverId?: string;
  operation: ShahryarVisitSyncOperation;
  supervisorId: string;
  absenceDate: string;
  workingTime?: string;
  gpsLocation: ShahryarGeoLocation;
  reason: 'ABSENT' | 'LATE' | 'NO_WORK';
  notes?: string;
  baseServerUpdatedAt?: string;
  clientUpdatedAt: string;
};

export type ShahryarMobileRecordSyncChange =
  | ShahryarMobileVisitSyncChange
  | ShahryarMobileWorkingTimeSyncChange
  | ShahryarMobilePaymentSyncChange
  | ShahryarMobileAbsenceSyncChange;

export type ShahryarMobileSyncRequest = {
  deviceId: string;
  lastPulledAt?: string;
  changes: ShahryarMobileRecordSyncChange[];
};

export type ShahryarMobileSyncAcceptedChange = {
  localId: string;
  recordKind: ShahryarMobileRecordKind;
  serverId?: string;
  operation: ShahryarVisitSyncOperation;
  acceptedAt: string;
};

export type ShahryarMobileSyncRejectedChange = {
  localId: string;
  recordKind?: ShahryarMobileRecordKind;
  reason: ShahryarMobileSyncRejectedReason;
};

export type ShahryarMobileServerSyncConflict = {
  localId: string;
  serverId: string;
  recordKind: ShahryarMobileRecordKind;
  reason: ShahryarMobileSyncConflictReason;
  clientUpdatedAt: string;
  serverUpdatedAt: string;
};

export type ShahryarMobileSyncResponse = {
  deviceId: string;
  nextPullCursor: string;
  acceptedChanges: ShahryarMobileSyncAcceptedChange[];
  conflicts: ShahryarMobileServerSyncConflict[];
  rejectedChanges: ShahryarMobileSyncRejectedChange[];
};

export type ShahryarMobileSyncQueueReconciliation = {
  queue: ShahryarMobileSyncQueueItem[];
  acceptedLocalIds: string[];
  conflictedLocalIds: string[];
  rejectedLocalIds: string[];
};

export type ShahryarMobileAssignedMarket = {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  address: string;
  district: string;
  gpsLocation: ShahryarGeoLocation;
  debtStatus: 'paid' | 'open' | 'partial';
};

export type ShahryarMobileSyncPullResponse = {
  serverTime: string;
  nextPullCursor: string;
  currentSupervisorId?: string;
  assignedMarkets: ShahryarMobileAssignedMarket[];
  serverVisits: ShahryarServerVisitSnapshot[];
  serverRecords: ShahryarServerRecordSnapshot[];
};

export type ShahryarMobilePhotoAssociationTargetType = 'market' | 'visit';

export type ShahryarMobilePhotoAssociationRequest = {
  localPhotoId: string;
  fileId: string;
  targetType: ShahryarMobilePhotoAssociationTargetType;
  targetId: string;
  capturedAt: string;
  gpsLocation?: ShahryarGeoLocation;
};

export type ShahryarMobilePhotoAssociationResponse = {
  localPhotoId: string;
  fileId: string;
  targetType: ShahryarMobilePhotoAssociationTargetType;
  targetId: string;
  associatedAt: string;
};

export type ShahryarMobileNotificationRegistrationRequest = {
  deviceId: string;
  expoPushToken: string;
  platform: 'android' | 'ios';
};

export type ShahryarMobileNotificationRegistrationResponse = {
  deviceId: string;
  registeredAt: string;
  enabledNotificationKinds: Array<'missing-report' | 'missed-visit'>;
};

export const getShahryarMobileRecordKind = (
  draftOrChange: ShahryarMobileRecordDraft | ShahryarMobileRecordSyncChange,
): ShahryarMobileRecordKind => draftOrChange.recordKind ?? 'visit';

export const createMobileSyncQueueItem = ({
  draft,
  now,
}: {
  draft: ShahryarMobileRecordDraft;
  now: string;
}): ShahryarMobileSyncQueueItem =>
  ({
    localId: draft.localId,
    recordKind: getShahryarMobileRecordKind(draft),
    status: 'pending',
    draft,
    createdAt: now,
    updatedAt: now,
  }) as ShahryarMobileSyncQueueItem;

export const createVisitSyncQueueItem = ({
  draft,
  now,
}: {
  draft: ShahryarMobileVisitDraft;
  now: string;
}): ShahryarMobileVisitSyncQueueItem =>
  createMobileSyncQueueItem({ draft, now }) as ShahryarMobileVisitSyncQueueItem;

export const markMobileSyncQueueItemPending = ({
  item,
  draft,
  now,
}: {
  item: ShahryarMobileSyncQueueItem;
  draft: ShahryarMobileRecordDraft;
  now: string;
}): ShahryarMobileSyncQueueItem =>
  ({
    ...item,
    recordKind: getShahryarMobileRecordKind(draft),
    status: 'pending',
    draft,
    updatedAt: now,
    conflict: undefined,
    rejection: undefined,
  }) as ShahryarMobileSyncQueueItem;

export const markVisitSyncQueueItemPending = ({
  item,
  draft,
  now,
}: {
  item: ShahryarMobileVisitSyncQueueItem;
  draft: ShahryarMobileVisitDraft;
  now: string;
}): ShahryarMobileVisitSyncQueueItem =>
  markMobileSyncQueueItemPending({
    item,
    draft,
    now,
  }) as ShahryarMobileVisitSyncQueueItem;

export const retryMobileSyncQueueItem = ({
  item,
  now,
}: {
  item: ShahryarMobileSyncQueueItem;
  now: string;
}): ShahryarMobileSyncQueueItem => ({
  ...item,
  status: 'pending',
  updatedAt: now,
  conflict: undefined,
  rejection: undefined,
});

export const discardMobileSyncQueueItem = ({
  item,
  now,
}: {
  item: ShahryarMobileSyncQueueItem;
  now: string;
}): ShahryarMobileSyncQueueItem => ({
  ...item,
  status: 'discarded',
  updatedAt: now,
  conflict: undefined,
  rejection: undefined,
});

const toServerRecordSnapshots = ({
  serverRecords,
  serverVisits,
}: {
  serverRecords?: ShahryarServerRecordSnapshot[];
  serverVisits?: ShahryarServerVisitSnapshot[];
}): ShahryarServerRecordSnapshot[] => [
  ...(serverRecords ?? []),
  ...(serverVisits ?? []).map((serverVisit) => ({
    id: serverVisit.id,
    recordKind: 'visit' as const,
    updatedAt: serverVisit.updatedAt,
  })),
];

export const resolveMobileSyncQueue = ({
  queue,
  serverRecords,
  serverVisits,
}: {
  queue: ShahryarMobileSyncQueueItem[];
  serverRecords?: ShahryarServerRecordSnapshot[];
  serverVisits?: ShahryarServerVisitSnapshot[];
}): ShahryarSyncResolution => {
  const serverRecordByKindAndId = new Map(
    toServerRecordSnapshots({ serverRecords, serverVisits }).map(
      (serverRecord) => [
        `${serverRecord.recordKind}:${serverRecord.id}`,
        serverRecord,
      ],
    ),
  );

  return queue.reduce<ShahryarSyncResolution>(
    (resolution, item) => {
      if (item.status === 'synced' || item.status === 'discarded') {
        resolution.itemsToKeepLocal.push(item);

        return resolution;
      }

      const serverRecord =
        item.draft.serverId === undefined
          ? undefined
          : serverRecordByKindAndId.get(
              `${item.recordKind}:${item.draft.serverId}`,
            );

      if (
        serverRecord !== undefined &&
        new Date(serverRecord.updatedAt) > new Date(item.draft.updatedAt)
      ) {
        const conflict: ShahryarMobileSyncConflict = {
          localId: item.localId,
          serverId: serverRecord.id,
          recordKind: item.recordKind,
          reason: 'server-newer',
          localUpdatedAt: item.draft.updatedAt,
          serverUpdatedAt: serverRecord.updatedAt,
        };

        resolution.conflicts.push(conflict);
        resolution.itemsToKeepLocal.push({
          ...item,
          status: 'conflict',
          conflict,
        });

        return resolution;
      }

      resolution.itemsToPush.push(item);

      return resolution;
    },
    {
      conflicts: [],
      itemsToKeepLocal: [],
      itemsToPush: [],
    },
  );
};

export const resolveVisitSyncQueue = ({
  queue,
  serverVisits,
}: {
  queue: ShahryarMobileVisitSyncQueueItem[];
  serverVisits: ShahryarServerVisitSnapshot[];
}): ShahryarSyncResolution =>
  resolveMobileSyncQueue({
    queue,
    serverVisits,
  });

const isValidDate = (isoDate: string): boolean =>
  Number.isFinite(Date.parse(isoDate));

const isVisitSyncChange = (
  change: ShahryarMobileRecordSyncChange,
): change is ShahryarMobileVisitSyncChange =>
  getShahryarMobileRecordKind(change) === 'visit';

const hasInvalidCartonCount = (
  change: ShahryarMobileVisitSyncChange,
): boolean => change.soldCartons < 0 || change.requestedCartons < 0;

const hasInvalidAmount = (change: ShahryarMobileRecordSyncChange): boolean =>
  change.recordKind === 'payment' &&
  (!Number.isFinite(change.amount) || change.amount < 0);

const hasInvalidDuration = (change: ShahryarMobileRecordSyncChange): boolean =>
  change.recordKind === 'working-time' &&
  (!Number.isFinite(change.totalMinutes) || change.totalMinutes < 0);

const getChangeOwnerId = (
  change: ShahryarMobileRecordSyncChange,
): string | undefined => {
  if (change.recordKind === 'payment') {
    return change.collectedById;
  }

  return change.supervisorId;
};

const getChangePrimaryDate = (
  change: ShahryarMobileRecordSyncChange,
): string | undefined => {
  if (change.recordKind === 'payment') {
    return change.paidAt ?? change.dueDate;
  }

  if (change.recordKind === 'absence') {
    return change.absenceDate;
  }

  if (change.recordKind === 'working-time') {
    return change.checkInAt;
  }

  return change.checkInAt;
};

const hasMissingRequiredField = (
  change: ShahryarMobileRecordSyncChange,
): boolean => {
  if (change.recordKind === 'payment') {
    return (
      change.marketId.trim().length === 0 ||
      change.collectedById.trim().length === 0
    );
  }

  if (change.recordKind === 'absence') {
    return change.supervisorId.trim().length === 0;
  }

  if (change.recordKind === 'working-time') {
    return change.supervisorId.trim().length === 0;
  }

  return (
    change.assignedMarketId.trim().length === 0 ||
    change.supervisorId.trim().length === 0 ||
    change.report.trim().length === 0
  );
};

const isValidChangeTimestamp = (
  change: ShahryarMobileRecordSyncChange,
): boolean => {
  const primaryDate = getChangePrimaryDate(change);

  if (primaryDate === undefined) {
    return false;
  }

  return isValidDate(primaryDate) && isValidDate(change.clientUpdatedAt);
};

export const resolveShahryarMobileSyncChanges = ({
  authorizedSupervisorId,
  changes,
  deviceId,
  serverRecords,
  serverVisits,
  syncedAt,
}: {
  authorizedSupervisorId?: string;
  changes: ShahryarMobileRecordSyncChange[];
  deviceId: string;
  serverRecords?: ShahryarServerRecordSnapshot[];
  serverVisits?: ShahryarServerVisitSnapshot[];
  syncedAt: string;
}): ShahryarMobileSyncResponse => {
  const serverRecordByKindAndId = new Map(
    toServerRecordSnapshots({ serverRecords, serverVisits }).map(
      (serverRecord) => [
        `${serverRecord.recordKind}:${serverRecord.id}`,
        serverRecord,
      ],
    ),
  );

  return changes.reduce<ShahryarMobileSyncResponse>(
    (response, change) => {
      const recordKind = getShahryarMobileRecordKind(change);

      if (
        authorizedSupervisorId !== undefined &&
        getChangeOwnerId(change) !== authorizedSupervisorId
      ) {
        response.rejectedChanges.push({
          localId: change.localId,
          recordKind,
          reason: 'unauthorized-supervisor',
        });

        return response;
      }

      if (hasMissingRequiredField(change)) {
        response.rejectedChanges.push({
          localId: change.localId,
          recordKind,
          reason: 'missing-required-field',
        });

        return response;
      }

      if (isVisitSyncChange(change) && hasInvalidCartonCount(change)) {
        response.rejectedChanges.push({
          localId: change.localId,
          recordKind,
          reason: 'invalid-carton-count',
        });

        return response;
      }

      if (hasInvalidAmount(change)) {
        response.rejectedChanges.push({
          localId: change.localId,
          recordKind,
          reason: 'invalid-amount',
        });

        return response;
      }

      if (hasInvalidDuration(change)) {
        response.rejectedChanges.push({
          localId: change.localId,
          recordKind,
          reason: 'invalid-duration',
        });

        return response;
      }

      if (!isValidChangeTimestamp(change)) {
        response.rejectedChanges.push({
          localId: change.localId,
          recordKind,
          reason: 'invalid-timestamp',
        });

        return response;
      }

      if (change.operation === 'update' && change.serverId === undefined) {
        response.rejectedChanges.push({
          localId: change.localId,
          recordKind,
          reason: 'missing-server-id',
        });

        return response;
      }

      const serverRecord =
        change.serverId === undefined
          ? undefined
          : serverRecordByKindAndId.get(`${recordKind}:${change.serverId}`);
      const conflictReferenceUpdatedAt =
        change.baseServerUpdatedAt ?? change.clientUpdatedAt;

      if (
        serverRecord !== undefined &&
        new Date(serverRecord.updatedAt) > new Date(conflictReferenceUpdatedAt)
      ) {
        response.conflicts.push({
          localId: change.localId,
          serverId: serverRecord.id,
          recordKind,
          reason: 'server-newer',
          clientUpdatedAt: change.clientUpdatedAt,
          serverUpdatedAt: serverRecord.updatedAt,
        });

        return response;
      }

      response.acceptedChanges.push({
        localId: change.localId,
        recordKind,
        serverId: change.serverId ?? `server-${change.localId}`,
        operation: change.operation,
        acceptedAt: syncedAt,
      });

      return response;
    },
    {
      deviceId,
      nextPullCursor: syncedAt,
      acceptedChanges: [],
      conflicts: [],
      rejectedChanges: [],
    },
  );
};

const reconcileAcceptedQueueItem = ({
  item,
  acceptedChange,
}: {
  item: ShahryarMobileSyncQueueItem;
  acceptedChange: ShahryarMobileSyncAcceptedChange;
}): ShahryarMobileSyncQueueItem => {
  const serverId = acceptedChange.serverId ?? item.draft.serverId;
  const syncedQueueItem = {
    status: 'synced' as const,
    updatedAt: acceptedChange.acceptedAt,
    lastSyncedAt: acceptedChange.acceptedAt,
    conflict: undefined,
    rejection: undefined,
  };

  switch (item.recordKind) {
    case 'visit':
      return {
        ...item,
        ...syncedQueueItem,
        draft: {
          ...item.draft,
          serverId,
        },
      };
    case 'working-time':
      return {
        ...item,
        ...syncedQueueItem,
        draft: {
          ...item.draft,
          serverId,
        },
      };
    case 'payment':
      return {
        ...item,
        ...syncedQueueItem,
        draft: {
          ...item.draft,
          serverId,
        },
      };
    case 'absence':
      return {
        ...item,
        ...syncedQueueItem,
        draft: {
          ...item.draft,
          serverId,
        },
      };
  }
};

export const reconcileVisitSyncQueueWithServerResponse = ({
  queue,
  response,
}: {
  queue: ShahryarMobileSyncQueueItem[];
  response: ShahryarMobileSyncResponse;
}): ShahryarMobileSyncQueueReconciliation => {
  const acceptedChangeByLocalId = new Map(
    response.acceptedChanges.map((change) => [change.localId, change]),
  );
  const conflictByLocalId = new Map(
    response.conflicts.map((conflict) => [conflict.localId, conflict]),
  );
  const rejectionByLocalId = new Map(
    response.rejectedChanges.map((rejection) => [rejection.localId, rejection]),
  );

  return {
    queue: queue.map((item) => {
      const acceptedChange = acceptedChangeByLocalId.get(item.localId);

      if (acceptedChange !== undefined) {
        return reconcileAcceptedQueueItem({ item, acceptedChange });
      }

      const conflict = conflictByLocalId.get(item.localId);

      if (conflict !== undefined) {
        return {
          ...item,
          status: 'conflict',
          updatedAt: response.nextPullCursor,
          conflict: {
            localId: conflict.localId,
            serverId: conflict.serverId,
            recordKind: conflict.recordKind,
            reason: conflict.reason,
            localUpdatedAt: conflict.clientUpdatedAt,
            serverUpdatedAt: conflict.serverUpdatedAt,
          },
          rejection: undefined,
        };
      }

      const rejection = rejectionByLocalId.get(item.localId);

      if (rejection !== undefined) {
        return {
          ...item,
          status: 'rejected',
          updatedAt: response.nextPullCursor,
          conflict: undefined,
          rejection,
        };
      }

      return item;
    }),
    acceptedLocalIds: response.acceptedChanges.map((change) => change.localId),
    conflictedLocalIds: response.conflicts.map((conflict) => conflict.localId),
    rejectedLocalIds: response.rejectedChanges.map(
      (rejection) => rejection.localId,
    ),
  };
};
