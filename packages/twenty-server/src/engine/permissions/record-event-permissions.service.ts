/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import groupBy from 'lodash.groupby';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { PermissionsMetadataMapsService } from 'src/engine/permissions/internal/combine/services/permissions-metadata-maps.service';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { filterReadableEvents } from 'src/engine/permissions/internal/combine/utils/filter-readable-events.util';
import { findGrantedRecordIds } from 'src/engine/permissions/internal/combine/utils/find-granted-record-ids.util';
import { resolveEventRecordSnapshots } from 'src/engine/permissions/internal/combine/utils/resolve-event-record-snapshots.util';
import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-role-ids.util';
import { type PrivateRecordState } from 'src/engine/permissions/internal/private-record/types/private-record-state.type';
import { RecordPermissionReadRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-permission-read.repository';
import { type RecordShareGrant } from 'src/engine/permissions/internal/record-share/types/record-share-grant.type';
import { getPermissionsPrincipalsRecordsPermissions } from 'src/engine/permissions/internal/role/utils/get-permissions-principals-records-permissions.util';
import { PrincipalPermissionsService } from 'src/engine/permissions/principal-permissions.service';
import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

type EventBatchAccessLoaders = {
  loadMetadataMaps: () => Promise<PermissionsMetadataMaps>;
  findReadableRecordIdsInBatch: (
    principals: PermissionsPrincipalsWithRolesContext,
  ) => Promise<Set<string>>;
};

@Injectable()
export class RecordEventPermissionsService {
  private readonly accessLoadersByEventBatch = new WeakMap<
    WorkspaceEventBatch<ObjectRecordEvent>,
    EventBatchAccessLoaders
  >();

  constructor(
    private readonly permissionsMetadataMapsService: PermissionsMetadataMapsService,
    private readonly recordPermissionReadRepository: RecordPermissionReadRepository,
    private readonly principalPermissionsService: PrincipalPermissionsService,
  ) {}

  async filterReadableEvents<TEvent extends ObjectRecordEvent>({
    authContext,
    eventBatch,
    events = eventBatch.events,
  }: {
    authContext: PermissionsAuthContext;
    eventBatch: WorkspaceEventBatch<TEvent>;
    events?: TEvent[];
  }): Promise<TEvent[]> {
    const principals =
      await this.principalPermissionsService.resolvePermissionsPrincipals({
        authContext,
      });

    if (!isDefined(principals)) {
      return [];
    }

    const { loadMetadataMaps, findReadableRecordIdsInBatch } =
      this.findEventBatchAccessLoaders(eventBatch);
    const metadataMaps = await loadMetadataMaps();

    if (
      getPermissionsPrincipalsRoleIds(principals).some(
        (roleId) => !isDefined(metadataMaps.rolesPermissions[roleId]),
      )
    ) {
      return [];
    }

    return filterReadableEvents({
      events,
      readableRecordIds: await findReadableRecordIdsInBatch(principals),
      objectMetadata: eventBatch.objectMetadata,
      recordsPermissions: getPermissionsPrincipalsRecordsPermissions({
        principals,
        metadataMaps,
      }),
      metadataMaps,
    });
  }

  private findEventBatchAccessLoaders(
    eventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
  ): EventBatchAccessLoaders {
    const cachedLoaders = this.accessLoadersByEventBatch.get(eventBatch);

    if (isDefined(cachedLoaders)) {
      return cachedLoaders;
    }

    const { workspaceId, objectMetadata, events } = eventBatch;

    // Operands only ask for records of the batch, so later calls reuse what was fetched
    const recordSharesByRecordIdByObject = new Map<
      string,
      Map<string, Promise<RecordShareGrant[]>>
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
        new Map<string, Promise<RecordShareGrant[]>>();

      recordSharesByRecordIdByObject.set(
        objectMetadataId,
        recordSharesByRecordId,
      );

      const uniqueRecordIds = [
        ...new Set(recordIds.map((recordId) => recordId.toLowerCase())),
      ];
      const missingRecordIds = uniqueRecordIds.filter(
        (recordId) => !recordSharesByRecordId.has(recordId),
      );

      if (missingRecordIds.length > 0) {
        const groupedRecordShares = this.recordPermissionReadRepository
          .findRecordShares({
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

    let metadataMaps: Promise<PermissionsMetadataMaps> | undefined;
    const loadMetadataMaps = () =>
      (metadataMaps ??= this.permissionsMetadataMapsService.load({
        workspaceId,
      }));

    let privateRecordStates:
      | Promise<Map<string, PrivateRecordState>>
      | undefined;
    const findPrivateRecordStates = () =>
      (privateRecordStates ??= loadMetadataMaps().then(
        ({ flatFieldMetadataMaps }) =>
          this.recordPermissionReadRepository.findPrivateRecordStates({
            workspaceId,
            flatObjectMetadata: objectMetadata,
            flatFieldMetadataMaps,
            recordIds: resolveEventRecordSnapshots(events).map(
              (record) => record.id,
            ),
          }),
      ));

    const findReadableRecordIdsInBatch = async (
      principals: PermissionsPrincipalsWithRolesContext,
    ) =>
      findGrantedRecordIds({
        principals,
        metadataMaps: await loadMetadataMaps(),
        flatObjectMetadata: objectMetadata,
        operationType: 'read',
        records: resolveEventRecordSnapshots(events),
        context: {
          shouldIgnoreSoftDeleteDefaultFilter: true,
          fetchRecordShares,
          findPrivateRecordStates,
        },
      });

    const loaders = { loadMetadataMaps, findReadableRecordIdsInBatch };

    this.accessLoadersByEventBatch.set(eventBatch, loaders);

    return loaders;
  }
}
