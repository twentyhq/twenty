/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { RecordShareAccessLevel } from 'twenty-shared/types';

import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';
import { RecordSharingReadService } from 'src/engine/permissions/record-share/services/record-sharing-read.service';
import { RecordShareRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-share.repository';
import { type RecordSharingDTO } from 'src/engine/permissions/record-share/dtos/record-sharing.dto';
import { type RecordSharingArgs } from 'src/engine/permissions/record-share/types/record-sharing-args.type';
import { findRecordSharingFlatObjectMetadataOrThrow } from 'src/engine/permissions/internal/record-share/utils/find-record-sharing-flat-object-metadata-or-throw.util';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { toPermissionsException } from 'src/engine/permissions/internal/record-permission-repository/utils/to-permissions-exception.util';
import { WorkspaceQueryExecutorService } from 'src/engine/workspace-query-executor/services/workspace-query-executor.service';
import { type RecordSharingChange } from 'src/engine/permissions/record-share/types/record-sharing-change.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class RecordSharingChangeService {
  constructor(
    private readonly workspaceQueryExecutorService: WorkspaceQueryExecutorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareRepository: RecordShareRepository,
    private readonly principalPermissionsReadService: PrincipalPermissionsReadService,
    private readonly recordPermissionsReadService: RecordPermissionsReadService,
    private readonly recordSharingReadService: RecordSharingReadService,
  ) {}

  async runChange({
    args,
    write,
    isChangeEnabled,
  }: {
    args: RecordSharingArgs;
    write: (change: RecordSharingChange) => Promise<void>;
    isChangeEnabled: (
      flags: Pick<RecordSharingChange, 'featureFlagsMap'>,
    ) => boolean;
  }): Promise<RecordSharingDTO> {
    const { flatObjectMetadataMaps, featureFlagsMap } =
      await this.workspaceCacheService.getOrRecompute(
        args.authContext.workspace.id,
        ['flatObjectMetadataMaps', 'featureFlagsMap'],
      );
    const flatObjectMetadata = findRecordSharingFlatObjectMetadataOrThrow({
      objectMetadataId: args.objectMetadataId,
      flatObjectMetadataMaps,
    });
    const workspaceId = args.authContext.workspace.id;

    if (!isChangeEnabled({ featureFlagsMap })) {
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

          await this.recordShareRepository.lockRecordForSharingChange({
            workspaceId,
            flatObjectMetadata,
            recordId: args.recordId,
            transactionScope,
          });

          const principals =
            await this.principalPermissionsReadService.resolvePermissionsPrincipals(
              {
                authContext: args.authContext,
              },
            );
          const isWritable =
            await this.recordPermissionsReadService.canAccessRecords({
              operationType: 'update',
              principals,
              objectMetadataId: args.objectMetadataId,
              recordIds: [args.recordId],
              transactionScope,
            });

          if (
            !isWritable ||
            !(await this.recordPermissionsReadService.canAllRecordsOrRowLevelPermissionsGrantOperation(
              {
                operationType: 'update',
                principals,
                objectMetadataId: args.objectMetadataId,
              },
            ))
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
            flatObjectMetadata,
            featureFlagsMap,
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
