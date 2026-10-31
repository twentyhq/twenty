/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { CREATED_BY_WORKSPACE_MEMBER_ID_COLUMN_NAME } from 'src/engine/permissions/private-record/constants/created-by-workspace-member-id-column-name.constant';
import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/permissions/private-record/constants/is-private-column-name.constant';
import { type PrivateRecordState } from 'src/engine/permissions/private-record/types/private-record-state.type';
import { findPrivateRecordStates } from 'src/engine/permissions/private-record/utils/find-private-record-states.util';
import { isPrivateRecordEnabled } from 'src/engine/permissions/private-record/utils/is-private-record-enabled.util';
import {
  RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/permissions/record-share/record-share.exception';
import { hasCreatedByField } from 'src/engine/permissions/private-record/utils/has-created-by-field.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const RECORD_SHARE_OBJECT_METADATA_NAME = 'recordShare';

@Injectable()
export class PrivateRecordStorageService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async findStates({
    workspaceId,
    flatObjectMetadata,
    recordIds,
    transactionScope,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    recordIds: string[];
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<Map<string, PrivateRecordState>> {
    const { flatFieldMetadataMaps, featureFlagsMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'featureFlagsMap',
      ]);

    if (!isPrivateRecordEnabled(featureFlagsMap)) {
      return new Map();
    }

    return this.withRepository({
      workspaceId,
      flatObjectMetadata,
      transactionScope,
      work: (repository) =>
        findPrivateRecordStates({
          repository,
          tableExpression: buildTableExpression({
            workspaceId,
            flatObjectMetadata,
          }),
          flatObjectMetadata,
          flatFieldMetadataMaps,
          recordIds,
        }),
    });
  }

  async grantPrivateRecordsCreatedBy({
    workspaceId,
    flatObjectMetadatas,
    creatorWorkspaceMemberId,
    granteeWorkspaceMemberId,
  }: {
    workspaceId: string;
    flatObjectMetadatas: FlatObjectMetadata[];
    creatorWorkspaceMemberId: string;
    granteeWorkspaceMemberId: string;
  }): Promise<void> {
    const { flatFieldMetadataMaps, featureFlagsMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'featureFlagsMap',
      ]);

    if (!isPrivateRecordEnabled(featureFlagsMap)) {
      return;
    }

    const objectsWithCreator = flatObjectMetadatas.filter(
      (flatObjectMetadata) =>
        hasCreatedByField({ flatObjectMetadata, flatFieldMetadataMaps }),
    );

    if (!isNonEmptyArray(objectsWithCreator)) {
      return;
    }

    await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.insertCustodianGrants({
          recordShareRepository: this.workspaceOrmManager.getRepository(
            RECORD_SHARE_OBJECT_METADATA_NAME,
            { shouldBypassPermissionChecks: true },
          ),
          workspaceId,
          objectsWithCreator,
          creatorWorkspaceMemberId,
          granteeWorkspaceMemberId,
        }),
      buildSystemAuthContext(workspaceId),
    );
  }

  private async insertCustodianGrants({
    recordShareRepository,
    workspaceId,
    objectsWithCreator,
    creatorWorkspaceMemberId,
    granteeWorkspaceMemberId,
  }: {
    recordShareRepository: WorkspaceRepository;
    workspaceId: string;
    objectsWithCreator: FlatObjectMetadata[];
    creatorWorkspaceMemberId: string;
    granteeWorkspaceMemberId: string;
  }): Promise<void> {
    const privateRecordSelects = objectsWithCreator.map(
      (flatObjectMetadata, index) =>
        `SELECT CAST(:objectMetadataId${index} AS uuid) AS "objectMetadataId", "id" AS "recordId" FROM ${buildTableExpression({ workspaceId, flatObjectMetadata })} WHERE ${escapeIdentifier(IS_PRIVATE_COLUMN_NAME)} AND ${escapeIdentifier(CREATED_BY_WORKSPACE_MEMBER_ID_COLUMN_NAME)} = :creatorWorkspaceMemberId`,
    );

    await recordShareRepository.executeRaw(
      `INSERT INTO ${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}."recordShare"
               ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
             SELECT private_record."objectMetadataId", private_record."recordId", :granteeWorkspaceMemberId, 'WORKSPACE_MEMBER', 'FULL', 'OWNER', private_record."recordId"
             FROM (${privateRecordSelects.join(' UNION ALL ')}) AS private_record
             ON CONFLICT DO NOTHING`,
      {
        creatorWorkspaceMemberId,
        granteeWorkspaceMemberId,
        ...Object.fromEntries(
          objectsWithCreator.map(({ id }, index) => [
            `objectMetadataId${index}`,
            id,
          ]),
        ),
      },
    );
  }

  async setPrivate({
    workspaceId,
    flatObjectMetadata,
    recordIds,
    isPrivate,
    transactionScope,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    recordIds: string[];
    isPrivate: boolean;
    transactionScope: WorkspaceTransactionScope;
  }): Promise<void> {
    if (!isNonEmptyArray(recordIds)) {
      return;
    }

    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );

    if (!isPrivateRecordEnabled(featureFlagsMap)) {
      if (!isPrivate) {
        return;
      }

      throw new RecordShareException(
        'Private records are not enabled for this workspace yet',
        RecordShareExceptionCode.INVALID_SHARE_WITH,
        {
          userFriendlyMessage: msg`Private records are not available in this workspace yet.`,
        },
      );
    }

    await this.withRepository({
      workspaceId,
      flatObjectMetadata,
      transactionScope,
      work: (repository) =>
        repository.executeRaw(
          `UPDATE ${buildTableExpression({ workspaceId, flatObjectMetadata })} SET ${escapeIdentifier(IS_PRIVATE_COLUMN_NAME)} = :isPrivate WHERE "id" = ANY(:recordIds)`,
          { isPrivate, recordIds },
        ),
    });
  }

  private async withRepository<TResult>({
    workspaceId,
    flatObjectMetadata,
    transactionScope,
    work,
  }: {
    workspaceId: string;
    flatObjectMetadata: Pick<FlatObjectMetadata, 'nameSingular'>;
    transactionScope?: WorkspaceTransactionScope;
    work: (repository: WorkspaceRepository) => Promise<TResult>;
  }): Promise<TResult> {
    if (isDefined(transactionScope)) {
      return work(
        transactionScope.getRepository(
          flatObjectMetadata.nameSingular,
          { shouldBypassPermissionChecks: true },
          { shouldSkipEventEmission: true },
        ),
      );
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        work(
          this.workspaceOrmManager.getRepository(
            flatObjectMetadata.nameSingular,
            { shouldBypassPermissionChecks: true },
            { shouldSkipEventEmission: true },
          ),
        ),
      buildSystemAuthContext(workspaceId),
    );
  }
}

const buildTableExpression = ({
  workspaceId,
  flatObjectMetadata,
}: {
  workspaceId: string;
  flatObjectMetadata: Parameters<typeof computeObjectTargetTable>[0];
}): string =>
  `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}.${escapeIdentifier(computeObjectTargetTable(flatObjectMetadata))}`;
