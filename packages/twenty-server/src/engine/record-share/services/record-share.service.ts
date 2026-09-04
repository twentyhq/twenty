import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { type RecordShareInput } from 'src/engine/record-share/types/record-share-input.type';
import { type RecordShare } from 'src/engine/record-share/types/record-share.type';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

const RECORD_SHARE_OBJECT_METADATA_NAME = 'recordShare';

type RecordShareRepository = WorkspaceRepository<RecordShare>;

@Injectable()
export class RecordShareService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  async insertMany({
    workspaceId,
    recordShares,
    transactionScope,
  }: {
    workspaceId: string;
    recordShares: RecordShareInput[];
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<void> {
    if (recordShares.length === 0) {
      return;
    }

    await this.withRepository({ workspaceId, transactionScope }, (repository) =>
      repository.insert(recordShares, { onConflictDoNothing: true }),
    );
  }

  async deleteBySourceId({
    workspaceId,
    sourceId,
    transactionScope,
  }: {
    workspaceId: string;
    sourceId: string;
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<void> {
    await this.withRepository({ workspaceId, transactionScope }, (repository) =>
      repository.delete({ sourceId }),
    );
  }

  async findByRecord({
    workspaceId,
    objectMetadataId,
    recordId,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    recordId: string;
  }): Promise<RecordShare[]> {
    return this.withRepository({ workspaceId }, (repository) =>
      repository.find({ where: { objectMetadataId, recordId } }),
    );
  }

  async findByRecordIds({
    workspaceId,
    objectMetadataId,
    recordIds,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    recordIds: string[];
  }): Promise<RecordShare[]> {
    if (recordIds.length === 0) {
      return [];
    }

    return this.withRepository({ workspaceId }, (repository) =>
      repository.find({
        where: { objectMetadataId, recordId: In(recordIds) },
      }),
    );
  }

  private async withRepository<TResult>(
    {
      workspaceId,
      transactionScope,
    }: {
      workspaceId: string;
      transactionScope?: WorkspaceTransactionScope;
    },
    work: (repository: RecordShareRepository) => Promise<TResult>,
  ): Promise<TResult> {
    if (isDefined(transactionScope)) {
      return work(
        transactionScope.getRepository<RecordShare>(
          RECORD_SHARE_OBJECT_METADATA_NAME,
          { shouldBypassPermissionChecks: true },
          { shouldSkipEventEmission: true },
        ),
      );
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        work(
          this.workspaceOrmManager.getRepository<RecordShare>(
            RECORD_SHARE_OBJECT_METADATA_NAME,
            { shouldBypassPermissionChecks: true },
            { shouldSkipEventEmission: true },
          ),
        ),
      buildSystemAuthContext(workspaceId),
    );
  }
}
