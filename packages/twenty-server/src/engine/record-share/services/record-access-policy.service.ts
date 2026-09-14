import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';
import { isNonEmptyString } from '@sniptt/guards';
import { In } from 'typeorm';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type EventRecordSnapshot } from 'src/engine/record-share/utils/resolve-event-record-snapshots.util';
import { type RowAccessPolicySubject } from 'src/engine/twenty-orm/utils/build-row-access-policy.util';
import { resolveInheritedReadabilityParents } from 'src/engine/twenty-orm/utils/resolve-inherited-readability-parents.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Decides for an identity that holds no auth context, an event consumer, what
// a query of that identity would return, by running the same row access policy
@Injectable()
export class RecordAccessPolicyService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async resolveReadableRecordIds({
    workspaceId,
    objectMetadata,
    recordIds,
    subject,
  }: {
    workspaceId: string;
    objectMetadata: FlatObjectMetadata;
    recordIds: string[];
    subject: RowAccessPolicySubject;
  }): Promise<Set<string>> {
    if (recordIds.length === 0) {
      return new Set();
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.selectReadableRecordIds({ objectMetadata, recordIds, subject }),
      buildSystemAuthContext(workspaceId),
    );
  }

  // The records of an INHERITED object readable through a parent: a record the
  // snapshot points at or a live child row pointing back at it, readable under
  // the subject's policy. The snapshot stands in for the row so that a record
  // destroyed by the event is still decided on
  async resolveRecordIdsReadableThroughParents({
    workspaceId,
    objectMetadata,
    records,
    subject,
  }: {
    workspaceId: string;
    objectMetadata: FlatObjectMetadata;
    records: EventRecordSnapshot[];
    subject: RowAccessPolicySubject;
  }): Promise<Set<string>> {
    if (records.length === 0) {
      return new Set();
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMapsOrm } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMapsOrm',
      ]);
    const parents = resolveInheritedReadabilityParents({
      flatObjectMetadata: objectMetadata,
      flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
      flatObjectMetadataMaps,
    });

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const readableRecordIds = new Set<string>();

      for (const parent of parents) {
        if (parent.kind === 'column') {
          const parentIdByRecordId = new Map(
            records.flatMap((record) => {
              const parentId = record[parent.joinColumnName];

              return isNonEmptyString(parentId) ? [[record.id, parentId]] : [];
            }),
          );
          const readableParentIds = await this.selectReadableRecordIds({
            objectMetadata: parent.parentFlatObjectMetadata,
            recordIds: [...new Set(parentIdByRecordId.values())],
            subject,
            depth: 1,
          });

          for (const [recordId, parentId] of parentIdByRecordId) {
            if (readableParentIds.has(parentId)) {
              readableRecordIds.add(recordId);
            }
          }

          continue;
        }

        const childRows = await this.workspaceOrmManager
          .getRepository(parent.childFlatObjectMetadata.nameSingular)
          .createQueryBuilder()
          .select(['id', parent.childJoinColumnName])
          .where({
            [parent.childJoinColumnName]: In(
              records.map((record) => record.id),
            ),
          })
          .getMany<ObjectRecord>({ noFormatting: true });
        const readableChildIds = await this.selectReadableRecordIds({
          objectMetadata: parent.childFlatObjectMetadata,
          recordIds: childRows.map((childRow) => String(childRow.id)),
          subject,
          depth: 1,
        });

        for (const childRow of childRows) {
          if (readableChildIds.has(String(childRow.id))) {
            readableRecordIds.add(String(childRow[parent.childJoinColumnName]));
          }
        }
      }

      return readableRecordIds;
    }, buildSystemAuthContext(workspaceId));
  }

  private async selectReadableRecordIds({
    objectMetadata,
    recordIds,
    subject,
    depth = 0,
  }: {
    objectMetadata: FlatObjectMetadata;
    recordIds: string[];
    subject: RowAccessPolicySubject;
    depth?: number;
  }): Promise<Set<string>> {
    if (recordIds.length === 0) {
      return new Set();
    }

    const repository = this.workspaceOrmManager.getRepository(
      objectMetadata.nameSingular,
    );
    const policy = repository.buildRowAccessPolicy({
      subject,
      operationType: 'select',
      depth,
    });

    switch (policy.kind) {
      case 'open':
        return new Set(recordIds);
      case 'denied':
        return new Set();
      case 'gated': {
        const rows = await repository
          .createQueryBuilder()
          .select(['id'])
          .where({ id: In(recordIds) })
          .withDeleted()
          .andWhere(policy.condition.sql, policy.condition.parameters)
          .getMany<ObjectRecord>({ noFormatting: true });

        return new Set(rows.map((row) => String(row.id)));
      }
    }
  }
}
