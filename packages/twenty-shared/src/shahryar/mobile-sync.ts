export type ShahryarVisitSyncOperation = 'create' | 'update';

export type ShahryarMobileSyncConflictReason = 'server-newer';

export type ShahryarMobileSyncRejectedReason =
  | 'invalid-carton-count'
  | 'invalid-timestamp'
  | 'missing-server-id'
  | 'unauthorized-supervisor';

export type ShahryarGeoLocation = {
  latitude: number;
  longitude: number;
};

export const SHAHRYAR_SUPERVISOR_VISIT_PHOTOS_FIELD_METADATA_UNIVERSAL_IDENTIFIER =
  '20202020-147c-4d5f-9c13-000000000001';

export type ShahryarMobileVisitDraft = {
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

export type ShahryarMobileSyncQueueItem = {
  localId: string;
  status: 'pending' | 'synced' | 'conflict' | 'rejected';
  draft: ShahryarMobileVisitDraft;
  createdAt: string;
  updatedAt: string;
  lastSyncedAt?: string;
  conflict?: ShahryarMobileSyncConflict;
  rejection?: ShahryarMobileSyncRejectedChange;
};

export type ShahryarServerVisitSnapshot = {
  id: string;
  updatedAt: string;
};

export type ShahryarMobileSyncConflict = {
  localId: string;
  serverId: string;
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

export type ShahryarMobileSyncRequest = {
  deviceId: string;
  lastPulledAt?: string;
  changes: ShahryarMobileVisitSyncChange[];
};

export type ShahryarMobileSyncAcceptedChange = {
  localId: string;
  serverId?: string;
  operation: ShahryarVisitSyncOperation;
  acceptedAt: string;
};

export type ShahryarMobileSyncRejectedChange = {
  localId: string;
  reason: ShahryarMobileSyncRejectedReason;
};

export type ShahryarMobileServerSyncConflict = {
  localId: string;
  serverId: string;
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

export const createVisitSyncQueueItem = ({
  draft,
  now,
}: {
  draft: ShahryarMobileVisitDraft;
  now: string;
}): ShahryarMobileSyncQueueItem => ({
  localId: draft.localId,
  status: 'pending',
  draft,
  createdAt: now,
  updatedAt: now,
});

export const markVisitSyncQueueItemPending = ({
  item,
  draft,
  now,
}: {
  item: ShahryarMobileSyncQueueItem;
  draft: ShahryarMobileVisitDraft;
  now: string;
}): ShahryarMobileSyncQueueItem => ({
  ...item,
  status: 'pending',
  draft,
  updatedAt: now,
  conflict: undefined,
  rejection: undefined,
});

export const resolveVisitSyncQueue = ({
  queue,
  serverVisits,
}: {
  queue: ShahryarMobileSyncQueueItem[];
  serverVisits: ShahryarServerVisitSnapshot[];
}): ShahryarSyncResolution => {
  const serverVisitById = new Map(
    serverVisits.map((serverVisit) => [serverVisit.id, serverVisit]),
  );

  return queue.reduce<ShahryarSyncResolution>(
    (resolution, item) => {
      if (item.status === 'synced') {
        resolution.itemsToKeepLocal.push(item);

        return resolution;
      }

      const serverVisit =
        item.draft.serverId === undefined
          ? undefined
          : serverVisitById.get(item.draft.serverId);

      if (
        serverVisit !== undefined &&
        new Date(serverVisit.updatedAt) > new Date(item.draft.updatedAt)
      ) {
        const conflict: ShahryarMobileSyncConflict = {
          localId: item.localId,
          serverId: serverVisit.id,
          reason: 'server-newer',
          localUpdatedAt: item.draft.updatedAt,
          serverUpdatedAt: serverVisit.updatedAt,
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

const isValidDate = (isoDate: string): boolean =>
  Number.isFinite(Date.parse(isoDate));

const hasInvalidCartonCount = (
  change: ShahryarMobileVisitSyncChange,
): boolean => change.soldCartons < 0 || change.requestedCartons < 0;

export const resolveShahryarMobileSyncChanges = ({
  authorizedSupervisorId,
  changes,
  deviceId,
  serverVisits,
  syncedAt,
}: {
  authorizedSupervisorId?: string;
  changes: ShahryarMobileVisitSyncChange[];
  deviceId: string;
  serverVisits: ShahryarServerVisitSnapshot[];
  syncedAt: string;
}): ShahryarMobileSyncResponse => {
  const serverVisitById = new Map(
    serverVisits.map((serverVisit) => [serverVisit.id, serverVisit]),
  );

  return changes.reduce<ShahryarMobileSyncResponse>(
    (response, change) => {
      if (
        authorizedSupervisorId !== undefined &&
        change.supervisorId !== authorizedSupervisorId
      ) {
        response.rejectedChanges.push({
          localId: change.localId,
          reason: 'unauthorized-supervisor',
        });

        return response;
      }

      if (hasInvalidCartonCount(change)) {
        response.rejectedChanges.push({
          localId: change.localId,
          reason: 'invalid-carton-count',
        });

        return response;
      }

      if (
        !isValidDate(change.checkInAt) ||
        !isValidDate(change.clientUpdatedAt)
      ) {
        response.rejectedChanges.push({
          localId: change.localId,
          reason: 'invalid-timestamp',
        });

        return response;
      }

      if (change.operation === 'update' && change.serverId === undefined) {
        response.rejectedChanges.push({
          localId: change.localId,
          reason: 'missing-server-id',
        });

        return response;
      }

      const serverVisit =
        change.serverId === undefined
          ? undefined
          : serverVisitById.get(change.serverId);
      const conflictReferenceUpdatedAt =
        change.baseServerUpdatedAt ?? change.clientUpdatedAt;

      if (
        serverVisit !== undefined &&
        new Date(serverVisit.updatedAt) > new Date(conflictReferenceUpdatedAt)
      ) {
        response.conflicts.push({
          localId: change.localId,
          serverId: serverVisit.id,
          reason: 'server-newer',
          clientUpdatedAt: change.clientUpdatedAt,
          serverUpdatedAt: serverVisit.updatedAt,
        });

        return response;
      }

      response.acceptedChanges.push({
        localId: change.localId,
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
        return {
          ...item,
          status: 'synced',
          draft: {
            ...item.draft,
            serverId: acceptedChange.serverId ?? item.draft.serverId,
          },
          updatedAt: acceptedChange.acceptedAt,
          lastSyncedAt: acceptedChange.acceptedAt,
          conflict: undefined,
          rejection: undefined,
        };
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
