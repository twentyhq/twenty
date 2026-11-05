/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { hasCreatedByField } from 'src/engine/permissions/private-record/utils/has-created-by-field.util';
import { PrivateRecordStorageService } from 'src/engine/permissions/private-record/services/private-record-storage.service';
import { PermissionsService } from 'src/engine/permissions/permissions.service';
import {
  type RecordSharePrincipalInput,
  type RecordSharingDTO,
} from 'src/engine/permissions/record-share/dtos/record-sharing.dto';
import { RecordSharePrincipalService } from 'src/engine/permissions/record-share/services/record-share-principal.service';
import { RecordShareStorageService } from 'src/engine/permissions/record-share/services/record-share-storage.service';
import { type RecordSharingArgs } from 'src/engine/permissions/record-share/types/record-sharing-args.type';
import { buildRecordShareLockKey } from 'src/engine/permissions/record-share/utils/build-record-share-lock-key.util';
import { resolveRecordSharePrincipalOrThrow } from 'src/engine/permissions/record-share/utils/resolve-record-share-principal-or-throw.util';
import {
  type RecordSharingObject,
  resolveRecordSharingObjectOrThrow,
} from 'src/engine/permissions/record-share/utils/resolve-record-sharing-object-or-throw.util';
import { validateShareWithPrincipalsOrThrow } from 'src/engine/permissions/record-share/utils/validate-share-with-principals-or-throw.util';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type RecordSharingChange = {
  workspaceId: string;
  transactionScope: WorkspaceTransactionScope;
  sharingObject: RecordSharingObject;
  creatorWorkspaceMemberId: string | undefined;
};

@Injectable()
export class RecordSharingWriteService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareStorageService: RecordShareStorageService,
    private readonly privateRecordStorageService: PrivateRecordStorageService,
    private readonly recordSharePrincipalService: RecordSharePrincipalService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async setPrivate(
    args: RecordSharingArgs & { isPrivate: boolean },
  ): Promise<RecordSharingDTO> {
    return this.changeSharing(args, (change) =>
      this.writeRecordPrivacy({ ...change, args }),
    );
  }

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

    return this.changeSharing(
      args,
      async ({ workspaceId, transactionScope, sharingObject }) => {
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
    );
  }

  async removeShare(
    args: RecordSharingArgs & { principal: RecordSharePrincipalInput },
  ): Promise<RecordSharingDTO> {
    const principal = resolveRecordSharePrincipalOrThrow(args.principal);

    return this.changeSharing(args, ({ workspaceId, transactionScope }) =>
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
    );
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

  setRecordsPrivate(
    args: Parameters<PrivateRecordStorageService['setPrivate']>[0],
  ): Promise<void> {
    return this.privateRecordStorageService.setPrivate(args);
  }

  private async changeSharing(
    args: RecordSharingArgs,
    write: (change: RecordSharingChange) => Promise<void>,
  ): Promise<RecordSharingDTO> {
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

    await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager.runInWorkspaceTransaction(
          async (transactionScope) => {
            await transactionScope.executeRawQuery(
              'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
              [
                buildRecordShareLockKey({
                  workspaceId,
                  objectMetadataId: args.objectMetadataId,
                  recordId: args.recordId,
                }),
              ],
            );
            // Lock the target as well as its grants, so deletion cannot leave an orphan grant.
            await transactionScope.executeRawQuery(
              `SELECT id FROM ${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}.${escapeIdentifier(computeObjectTargetTable(flatObjectMetadata))} WHERE id = $1 FOR UPDATE`,
              [args.recordId],
            );
            const repository = transactionScope.getRepository(
              flatObjectMetadata.nameSingular,
            );
            const writableIds =
              await repository.findRecordIdsAllowedForOperation({
                recordIds: [args.recordId],
                operationType: 'update',
                withDeleted: true,
              });
            // A grant may let someone edit a record beyond their role, never
            // decide who else gets it
            if (
              writableIds.length !== 1 ||
              !repository.isObjectOperationPermittedByRole('update')
            ) {
              throw new NotFoundError('Record not found');
            }
            const { viewerAccessLevel, creatorWorkspaceMemberId } =
              await this.permissionsService.findViewerRecordAccess({
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
        ),
      args.authContext,
    );

    return this.permissionsService.findRecordSharingAfterChange(args);
  }

  private async writeRecordPrivacy({
    workspaceId,
    transactionScope,
    sharingObject: { flatObjectMetadata },
    creatorWorkspaceMemberId,
    args,
  }: RecordSharingChange & {
    args: RecordSharingArgs & { isPrivate: boolean };
  }): Promise<void> {
    const { isPrivate } = args;
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    await this.privateRecordStorageService.setPrivate({
      workspaceId,
      flatObjectMetadata,
      recordIds: [args.recordId],
      isPrivate,
      transactionScope,
    });

    // An owner row, unlike a share, survives the share removals of whoever made the record private
    if (!isPrivate) {
      if (!hasCreatedByField({ flatObjectMetadata, flatFieldMetadataMaps })) {
        return;
      }

      await this.recordShareStorageService.deleteMatching({
        workspaceId,
        transactionScope,
        criteria: {
          objectMetadataId: args.objectMetadataId,
          recordIds: [args.recordId],
          rowCause: RecordShareRowCause.OWNER,
        },
      });

      return;
    }

    await this.recordShareStorageService.deleteMatching({
      workspaceId,
      transactionScope,
      criteria: {
        objectMetadataId: args.objectMetadataId,
        recordIds: [args.recordId],
        principalType: RecordSharePrincipalType.EVERYONE,
        rowCause: RecordShareRowCause.MANUAL,
      },
    });

    if (args.authContext.workspaceMemberId === creatorWorkspaceMemberId) {
      return;
    }

    await this.recordShareStorageService.insertMany({
      workspaceId,
      transactionScope,
      recordShares: [
        {
          recordId: args.recordId,
          objectMetadataId: args.objectMetadataId,
          principalId: args.authContext.workspaceMemberId,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          accessLevel: RecordShareAccessLevel.FULL,
          rowCause: RecordShareRowCause.OWNER,
          sourceId: args.recordId,
        },
      ],
    });
  }
}
