import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { isNonEmptyString } from '@sniptt/guards';
import { In } from 'typeorm';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { indexRecordSharesByRecordId } from 'src/engine/record-share/utils/index-record-shares-by-record-id.util';
import { isRecordAdmittedByRecordShareGate } from 'src/engine/record-share/utils/is-record-admitted-by-record-share-gate.util';
import { type EventRecordSnapshot } from 'src/engine/record-share/utils/resolve-event-record-snapshots.util';
import { resolveRecordShareGateKind } from 'src/engine/record-share/utils/resolve-record-share-gate-kind.util';
import { MAX_INHERITED_READABILITY_DEPTH } from 'src/engine/twenty-orm/constants/max-inherited-readability-depth.constant';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/twenty-orm/repository/resolve-required-record-share-access-levels.util';
import { type InheritedReadabilityChildrenParent } from 'src/engine/twenty-orm/types/inherited-readability-children-parent.type';
import { type InheritedReadabilityColumnParent } from 'src/engine/twenty-orm/types/inherited-readability-column-parent.type';
import { type RowAccessPolicySubject } from 'src/engine/twenty-orm/utils/build-row-access-policy.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { isObjectOperationPermitted } from 'src/engine/twenty-orm/utils/is-object-operation-permitted.util';
import { isRecordMatchingRLSRowLevelPermissionPredicate } from 'src/engine/twenty-orm/utils/is-record-matching-rls-row-level-permission-predicate.util';
import { resolveInheritedReadabilityParents } from 'src/engine/twenty-orm/utils/resolve-inherited-readability-parents.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type ReadabilityMaps = {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMapsOrm: FlatEntityMaps<OrmFlatFieldMetadata>;
};

type SnapshotEvaluation = {
  workspaceId: string;
  objectMetadata: FlatObjectMetadata;
  snapshots: EventRecordSnapshot[];
  subject: RowAccessPolicySubject;
  depth: number;
  maps: ReadabilityMaps;
};

@Injectable()
export class RecordAccessPolicyService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareService: RecordShareService,
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

    const maps = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMapsOrm',
    ]);

    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.resolveSnapshotIdsReadableThroughParents({
          workspaceId,
          objectMetadata,
          snapshots: records,
          subject,
          depth: 0,
          maps,
        }),
      buildSystemAuthContext(workspaceId),
    );
  }

  private async resolveSnapshotIdsReadableThroughParents(
    evaluation: SnapshotEvaluation,
  ): Promise<Set<string>> {
    const parents = resolveInheritedReadabilityParents({
      flatObjectMetadata: evaluation.objectMetadata,
      flatFieldMetadataMaps: evaluation.maps.flatFieldMetadataMapsOrm,
      flatObjectMetadataMaps: evaluation.maps.flatObjectMetadataMaps,
    });
    const readableSnapshotIds = new Set<string>();

    for (const parent of parents) {
      const readableIds =
        parent.kind === 'column'
          ? await this.resolveSnapshotIdsReadableThroughColumnParent({
              ...evaluation,
              parent,
            })
          : await this.resolveSnapshotIdsReadableThroughChildren({
              ...evaluation,
              parent,
            });

      for (const readableId of readableIds) {
        readableSnapshotIds.add(readableId);
      }
    }

    return readableSnapshotIds;
  }

  private async resolveSnapshotIdsReadableThroughColumnParent({
    snapshots,
    subject,
    depth,
    parent,
  }: SnapshotEvaluation & {
    parent: InheritedReadabilityColumnParent;
  }): Promise<Set<string>> {
    const parentIdBySnapshotId = new Map(
      snapshots.flatMap((snapshot) => {
        const parentId = snapshot[parent.joinColumnName];

        return isNonEmptyString(parentId) ? [[snapshot.id, parentId]] : [];
      }),
    );
    const readableParentIds = await this.selectReadableRecordIds({
      objectMetadata: parent.parentFlatObjectMetadata,
      recordIds: [...new Set(parentIdBySnapshotId.values())],
      subject,
      depth: depth + 1,
    });

    return new Set(
      [...parentIdBySnapshotId]
        .filter(([, parentId]) => readableParentIds.has(parentId))
        .map(([snapshotId]) => snapshotId),
    );
  }

  private async resolveSnapshotIdsReadableThroughChildren({
    workspaceId,
    snapshots,
    subject,
    depth,
    maps,
    parent,
  }: SnapshotEvaluation & {
    parent: InheritedReadabilityChildrenParent;
  }): Promise<Set<string>> {
    const childNameSingular = parent.childFlatObjectMetadata.nameSingular;
    const capturedChildSnapshotsBySnapshotId = new Map(
      snapshots.flatMap((snapshot) => {
        const capturedChildRecords =
          snapshot.inheritedReadabilityChildRecords?.[childNameSingular];

        return isDefined(capturedChildRecords)
          ? [
              [
                snapshot.id,
                capturedChildRecords.map(
                  (childRecord): EventRecordSnapshot => ({
                    ...childRecord,
                    id: String(childRecord.id),
                  }),
                ),
              ] as const,
            ]
          : [];
      }),
    );
    const liveSnapshotIds = snapshots
      .filter(
        (snapshot) => !capturedChildSnapshotsBySnapshotId.has(snapshot.id),
      )
      .map((snapshot) => snapshot.id);

    const readableSnapshotIds = new Set<string>();

    if (liveSnapshotIds.length > 0) {
      const childRows = await this.workspaceOrmManager
        .getRepository(childNameSingular)
        .createQueryBuilder()
        .select(['id', parent.childJoinColumnName])
        .where({ [parent.childJoinColumnName]: In(liveSnapshotIds) })
        .getMany<ObjectRecord>({ noFormatting: true });
      const readableChildIds = await this.selectReadableRecordIds({
        objectMetadata: parent.childFlatObjectMetadata,
        recordIds: childRows.map((childRow) => String(childRow.id)),
        subject,
        depth: depth + 1,
      });

      for (const childRow of childRows) {
        if (readableChildIds.has(String(childRow.id))) {
          readableSnapshotIds.add(String(childRow[parent.childJoinColumnName]));
        }
      }
    }

    const readableCapturedChildIds = await this.resolveReadableSnapshotIds({
      workspaceId,
      objectMetadata: parent.childFlatObjectMetadata,
      snapshots: [...capturedChildSnapshotsBySnapshotId.values()].flat(),
      subject,
      depth: depth + 1,
      maps,
    });

    for (const [
      snapshotId,
      capturedChildSnapshots,
    ] of capturedChildSnapshotsBySnapshotId) {
      if (
        capturedChildSnapshots.some((childSnapshot) =>
          readableCapturedChildIds.has(childSnapshot.id),
        )
      ) {
        readableSnapshotIds.add(snapshotId);
      }
    }

    return readableSnapshotIds;
  }

  private async resolveReadableSnapshotIds(
    evaluation: SnapshotEvaluation,
  ): Promise<Set<string>> {
    const { objectMetadata, snapshots, subject, depth, maps } = evaluation;

    if (snapshots.length === 0 || depth > MAX_INHERITED_READABILITY_DEPTH) {
      return new Set();
    }

    if (
      isDefined(subject.objectsPermissions) &&
      !isObjectOperationPermitted({
        objectMetadata,
        operationType: 'select',
        objectsPermissions: subject.objectsPermissions,
      })
    ) {
      return new Set();
    }

    const rowLevelPermissionRecordFilter =
      subject.resolveRowLevelPermissionRecordFilter(objectMetadata);
    const candidateSnapshots =
      isDefined(rowLevelPermissionRecordFilter) &&
      Object.keys(rowLevelPermissionRecordFilter).length > 0
        ? snapshots.filter((snapshot) =>
            isRecordMatchingRLSRowLevelPermissionPredicate({
              record: snapshot,
              filter: rowLevelPermissionRecordFilter,
              flatObjectMetadata: objectMetadata,
              flatFieldMetadataMaps: maps.flatFieldMetadataMapsOrm,
              shouldIgnoreSoftDeleteDefaultFilter: true,
            }),
          )
        : snapshots;
    const gateKind = resolveRecordShareGateKind({
      readability: objectMetadata.readability,
      isOwningApplication: subject.isOwningApplication(objectMetadata),
    });

    switch (gateKind) {
      case 'open':
        return new Set(candidateSnapshots.map((snapshot) => snapshot.id));
      case 'deny':
        return new Set();
      case 'private':
        return this.resolveSnapshotIdsSharedWithSubject({
          ...evaluation,
          snapshots: candidateSnapshots,
        });
      case 'inherited':
        return new Set([
          ...(await this.resolveSnapshotIdsSharedWithSubject({
            ...evaluation,
            snapshots: candidateSnapshots,
          })),
          ...(await this.resolveSnapshotIdsReadableThroughParents({
            ...evaluation,
            snapshots: candidateSnapshots,
          })),
        ]);
      default:
        return assertUnreachable(gateKind);
    }
  }

  private async resolveSnapshotIdsSharedWithSubject({
    workspaceId,
    objectMetadata,
    snapshots,
    subject,
  }: SnapshotEvaluation): Promise<Set<string>> {
    const snapshotIds = snapshots.map((snapshot) => snapshot.id);

    if (!isDefined(subject.principalIds) || snapshotIds.length === 0) {
      return new Set(snapshotIds);
    }

    const recordShareGate = {
      recordSharesByRecordId: indexRecordSharesByRecordId(
        await this.recordShareService.findByRecordIds({
          workspaceId,
          objectMetadataId: objectMetadata.id,
          recordIds: snapshotIds,
        }),
      ),
      principalIds: subject.principalIds,
      recordIdsReadableThroughParents: new Set<string>(),
    };

    return new Set(
      snapshotIds.filter((recordId) =>
        isRecordAdmittedByRecordShareGate({
          recordShareGate,
          recordId,
          accessLevels: resolveRequiredRecordShareAccessLevels('select'),
        }),
      ),
    );
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
