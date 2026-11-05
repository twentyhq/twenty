/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { RecordShareAccessLevel } from 'twenty-shared/types';

import {
  type RecordSharePrincipalInput,
  type RecordSharingDTO,
} from 'src/engine/permissions/record-share/dtos/record-sharing.dto';
import { RecordSharingChangeService } from 'src/engine/permissions/record-share/services/record-sharing-change.service';
import { RecordSharePrincipalService } from 'src/engine/permissions/record-share/services/record-share-principal.service';
import { RecordShareStorageService } from 'src/engine/permissions/record-share/services/record-share-storage.service';
import { type RecordSharingArgs } from 'src/engine/permissions/record-share/types/record-sharing-args.type';
import { resolveRecordSharePrincipalOrThrow } from 'src/engine/permissions/record-share/utils/resolve-record-share-principal-or-throw.util';
import { validateShareWithPrincipalsOrThrow } from 'src/engine/permissions/record-share/utils/validate-share-with-principals-or-throw.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class RecordSharingWriteService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareStorageService: RecordShareStorageService,
    private readonly recordSharingChangeService: RecordSharingChangeService,
    private readonly recordSharePrincipalService: RecordSharePrincipalService,
  ) {}

  async setShare(
    args: RecordSharingArgs & {
      principal: RecordSharePrincipalInput;
      accessLevel: RecordShareAccessLevel;
    },
  ): Promise<RecordSharingDTO> {
    const maps = await this.workspaceCacheService.getOrRecompute(
      args.authContext.workspace.id,
      ['flatWorkspaceMemberMaps', 'flatRoleMaps'],
    );
    const [principal] = validateShareWithPrincipalsOrThrow({
      shareWith: [{ ...args.principal, accessLevel: args.accessLevel }],
      ...maps,
    });

    return this.recordSharingChangeService.runChange({
      args,
      write: async ({ workspaceId, transactionScope, sharingObject }) => {
        await this.recordShareStorageService.setManualShare({
          workspaceId,
          transactionScope,
          enabled: true,
          share: {
            ...principal,
            objectMetadataId: args.objectMetadataId,
            recordId: args.recordId,
            sourceId: args.recordId,
          },
        });
        await this.recordSharePrincipalService.assertPrincipalsReachRecordsOrThrow(
          {
            workspaceId,
            transactionScope,
            flatObjectMetadata: sharingObject.flatObjectMetadata,
            canShareBeyondRole: sharingObject.canShareBeyondRole,
            principals: [principal],
            recordIds: [args.recordId],
          },
        );
      },
    });
  }

  async removeShare(
    args: RecordSharingArgs & { principal: RecordSharePrincipalInput },
  ): Promise<RecordSharingDTO> {
    const principal = resolveRecordSharePrincipalOrThrow(args.principal);

    return this.recordSharingChangeService.runChange({
      args,
      write: ({ workspaceId, transactionScope }) =>
        this.recordShareStorageService.setManualShare({
          workspaceId,
          transactionScope,
          enabled: false,
          share: {
            ...principal,
            accessLevel: RecordShareAccessLevel.READ,
            objectMetadataId: args.objectMetadataId,
            recordId: args.recordId,
            sourceId: args.recordId,
          },
        }),
    });
  }

  insertRecordShares(
    args: Parameters<RecordShareStorageService['insertMany']>[0],
  ): Promise<void> {
    return this.recordShareStorageService.insertMany(args);
  }

  deleteRecordSharesByRecordIds(
    args: Parameters<RecordShareStorageService['deleteByRecordIds']>[0],
  ): Promise<void> {
    return this.recordShareStorageService.deleteByRecordIds(args);
  }

  deleteRecordSharesMatching(
    args: Parameters<RecordShareStorageService['deleteMatching']>[0],
  ): Promise<void> {
    return this.recordShareStorageService.deleteMatching(args);
  }
}
