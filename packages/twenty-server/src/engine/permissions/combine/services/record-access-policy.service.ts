/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import groupBy from 'lodash.groupby';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { PrivateRecordStorageService } from 'src/engine/permissions/private-record/services/private-record-storage.service';
import { type PrivateRecordState } from 'src/engine/permissions/private-record/types/private-record-state.type';
import { RecordShareStorageService } from 'src/engine/permissions/record-share/services/record-share-storage.service';
import { type EventRecordAccessGate } from 'src/engine/permissions/combine/types/event-record-access-gate.type';
import { type RecordShare } from 'src/engine/permissions/record-share/types/record-share.type';
import { findPermissionsAdmittedRecordIds } from 'src/engine/permissions/combine/utils/find-permissions-admitted-record-ids.util';
import { loadPermissionsEnvironment } from 'src/engine/permissions/combine/utils/load-permissions-environment.util';
import { resolveEventRecordSnapshots } from 'src/engine/permissions/combine/utils/resolve-event-record-snapshots.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

@Injectable()
export class RecordAccessPolicyService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareStorageService: RecordShareStorageService,
    private readonly privateRecordStorageService: PrivateRecordStorageService,
  ) {}

  // A principal receives the records a query would return it: the event
  // snapshots are run through the same row access policy as its queries.
  buildEventRecordAccessGate({
    workspaceId,
    objectMetadata,
    events,
  }: WorkspaceEventBatch<ObjectRecordEvent>): EventRecordAccessGate {
    // One lookup per object for the whole batch: operands only ever ask for
    // records of the batch, so later calls are served from what was fetched
    const recordSharesByRecordIdByObject = new Map<
      string,
      Map<string, Promise<RecordShare[]>>
    >();
    const fetchRecordShares = async ({
      objectMetadataId,
      recordIds,
    }: {
      objectMetadataId: string;
      recordIds: string[];
    }) => {
      const recordSharesByRecordId =
        recordSharesByRecordIdByObject.get(objectMetadataId) ??
        new Map<string, Promise<RecordShare[]>>();

      recordSharesByRecordIdByObject.set(
        objectMetadataId,
        recordSharesByRecordId,
      );

      const uniqueRecordIds = [...new Set(recordIds)];
      const missingRecordIds = uniqueRecordIds.filter(
        (recordId) => !recordSharesByRecordId.has(recordId),
      );

      if (missingRecordIds.length > 0) {
        const groupedRecordShares = this.recordShareStorageService
          .findByRecordIds({
            workspaceId,
            objectMetadataId,
            recordIds: missingRecordIds,
          })
          .then((recordShares) =>
            groupBy(recordShares, (recordShare) => recordShare.recordId),
          );

        for (const recordId of missingRecordIds) {
          recordSharesByRecordId.set(
            recordId,
            groupedRecordShares.then(
              (recordSharesOfRecord) => recordSharesOfRecord[recordId] ?? [],
            ),
          );
        }
      }

      const recordSharesPerRecord = await Promise.all(
        uniqueRecordIds.map(
          (recordId) => recordSharesByRecordId.get(recordId) ?? [],
        ),
      );

      return recordSharesPerRecord.flat();
    };

    let privateRecordStates:
      | Promise<Map<string, PrivateRecordState>>
      | undefined;
    const findPrivateRecordStates = () =>
      (privateRecordStates ??= this.privateRecordStorageService.findStates({
        workspaceId,
        flatObjectMetadata: objectMetadata,
        recordIds: resolveEventRecordSnapshots(events).map(
          (record) => record.id,
        ),
      }));

    return {
      resolveAdmittedRecordIds: async (principal) =>
        findPermissionsAdmittedRecordIds({
          principal,
          environment: await loadPermissionsEnvironment({
            workspaceCacheService: this.workspaceCacheService,
            workspaceId,
          }),
          flatObjectMetadata: objectMetadata,
          operationType: 'select',
          records: resolveEventRecordSnapshots(events),
          context: {
            shouldIgnoreSoftDeleteDefaultFilter: true,
            fetchRecordShares,
            findPrivateRecordStates,
          },
        }),
    };
  }
}
