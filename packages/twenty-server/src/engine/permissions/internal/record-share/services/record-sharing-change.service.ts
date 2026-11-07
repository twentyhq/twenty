/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { RecordShareAccessLevel } from 'twenty-shared/types';

import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PrincipalPermissionsService } from 'src/engine/permissions/principal-permissions.service';
import { RecordPermissionsService } from 'src/engine/permissions/record-permissions.service';
import { RecordSharingReadService } from 'src/engine/permissions/internal/record-share/services/record-sharing-read.service';
import { RecordShareWriteOrmService } from 'src/engine/permissions/internal/record-permission-orm/services/record-share-write-orm.service';
import { type RecordSharingDTO } from 'src/engine/permissions/record-share/dtos/record-sharing.dto';
import { type RecordSharingArgs } from 'src/engine/permissions/record-share/types/record-sharing-args.type';
import {
  type RecordSharingObject,
  resolveRecordSharingObjectOrThrow,
} from 'src/engine/permissions/internal/record-share/utils/resolve-record-sharing-object-or-throw.util';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { toPermissionsException } from 'src/engine/permissions/internal/record-permission-orm/utils/to-permissions-exception.util';
import { WorkspaceQueryExecutorService } from 'src/engine/workspace-query-executor/services/workspace-query-executor.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export type RecordSharingChange = {
  workspaceId: string;
  transactionScope: RecordPermissionTransactionScope;
  sharingObject: RecordSharingObject;
  creatorWorkspaceMemberId: string | undefined;
};

@Injectable()
export class RecordSharingChangeService {
  constructor(
    private readonly workspaceQueryExecutorService: WorkspaceQueryExecutorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareWriteOrmService: RecordShareWriteOrmService,
    private readonly principalPermissionsService: PrincipalPermissionsService,
    private readonly recordPermissionsService: RecordPermissionsService,
    private readonly recordSharingReadService: RecordSharingReadService,
  ) {}

  async runChange({
    args,
    write,
  }: {
    args: RecordSharingArgs;
    write: (change: RecordSharingChange) => Promise<void>;
  }): Promise<RecordSharingDTO> {
    const { flatObjectMetadataMaps, featureFlagsMap } =
      await this.workspaceCacheService.getOrRecompute(
        args.authContext.workspace.id,
        ['flatObjectMetadataMaps', 'featureFlagsMap'],
      );
    const sharingObject = resolveRecordSharingObjectOrThrow({
      objectMetadataId: args.objectMetadataId,
      flatObjectMetadataMaps,
      featureFlagsMap,
    });
    const { flatObjectMetadata } = sharingObject;
    const workspaceId = args.authContext.workspace.id;

    if (!sharingObject.isShareable) {
      throw new NotFoundError('Record not found');
    }

    try {
      await this.workspaceQueryExecutorService.runInTransaction(
        async (executor) => {
          const transactionScope: RecordPermissionTransactionScope = {
            workspaceId,
            executeRawQuery: (sql, parameters = []) =>
              executor.execute({ text: sql, values: parameters }),
          };

          await this.recordShareWriteOrmService.lockRecordForSharingChange({
            workspaceId,
            flatObjectMetadata,
            recordId: args.recordId,
            transactionScope,
          });

          const principals =
            await this.principalPermissionsService.resolvePermissionsPrincipals(
              {
                authContext: args.authContext,
              },
            );
          const isWritable =
            await this.recordPermissionsService.canAccessRecords({
              operationType: 'update',
              principals,
              objectMetadataId: args.objectMetadataId,
              recordIds: [args.recordId],
              transactionScope,
            });

          if (
            !isWritable ||
            !(await this.recordPermissionsService.canRoleAccessSomeRecords({
              operationType: 'update',
              principals,
              objectMetadataId: args.objectMetadataId,
            }))
          ) {
            throw new NotFoundError('Record not found');
          }

          const { viewerAccessLevel, creatorWorkspaceMemberId } =
            await this.recordSharingReadService.findViewerRecordAccess({
              ...args,
              transactionScope,
            });

          if (viewerAccessLevel !== RecordShareAccessLevel.FULL) {
            throw new NotFoundError('Record not found');
          }

          await write({
            workspaceId,
            transactionScope,
            sharingObject,
            creatorWorkspaceMemberId,
          });
        },
      );
    } catch (error) {
      throw toPermissionsException(error);
    }

    return this.recordSharingReadService.findRecordSharingAfterChange(args);
  }
}
