import { Injectable } from '@nestjs/common';

import {
  MetadataReadability,
  ObjectAccessInheritanceMatch,
  type ObjectRecord,
  type ObjectsPermissions,
  type RecordShareAccessLevel,
} from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { indexRecordSharesByRecordId } from 'src/engine/record-share/utils/index-record-shares-by-record-id.util';
import { extractEventRecord } from 'src/engine/record-share/utils/extract-event-record.util';
import { isRecordSharedWithPrincipals } from 'src/engine/record-share/utils/is-record-shared-with-principals.util';
import {
  type InheritanceBranch,
  resolveObjectAccessInheritance,
} from 'src/engine/twenty-orm/utils/resolve-object-access-inheritance.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

// Mirrors the SQL gate the ORM builds for an INHERITED object, for the event
// paths that hold records in memory instead of querying them
export type InheritedAccessEvaluationContext = {
  workspaceId: string;
  principalIds: string[];
  accessLevels: RecordShareAccessLevel[];
  applicationId?: string | null;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  objectsPermissions?: ObjectsPermissions;
  isParentRecordMatchingRowLevelPermissions?: (args: {
    parentFlatObjectMetadata: FlatObjectMetadata;
    parentRecord: ObjectRecord;
  }) => boolean;
};

const MAX_INHERITED_ACCESS_DEPTH = 5;

type ParentAuthorization = Map<string, boolean>;

@Injectable()
export class InheritedRecordAccessService {
  constructor(
    private readonly recordShareService: RecordShareService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  // Events carry the row they describe, so the parent columns are read from the
  // payload and only the parents themselves are looked up
  async resolveAuthorizedEventRecordIds({
    flatObjectMetadata,
    events,
    context,
  }: {
    flatObjectMetadata: FlatObjectMetadata;
    events: { recordId: string; properties?: unknown }[];
    context: InheritedAccessEvaluationContext;
  }): Promise<Set<string>> {
    return this.resolveAuthorizedRecordIds({
      flatObjectMetadata,
      records: events.map((event) => ({
        ...extractEventRecord(event.properties),
        id: event.recordId,
      })),
      context,
    });
  }

  async resolveAuthorizedRecordIds({
    flatObjectMetadata,
    records,
    context,
  }: {
    flatObjectMetadata: FlatObjectMetadata;
    records: Record<string, unknown>[];
    context: InheritedAccessEvaluationContext;
  }): Promise<Set<string>> {
    return this.resolveAuthorizedRecordIdsAtDepth({
      flatObjectMetadata,
      records,
      context,
      depth: 0,
    });
  }

  private async resolveAuthorizedRecordIdsAtDepth({
    flatObjectMetadata,
    records,
    context,
    depth,
  }: {
    flatObjectMetadata: FlatObjectMetadata;
    records: Record<string, unknown>[];
    context: InheritedAccessEvaluationContext;
    depth: number;
  }): Promise<Set<string>> {
    const authorizedRecordIds = new Set<string>();

    if (depth >= MAX_INHERITED_ACCESS_DEPTH) {
      return authorizedRecordIds;
    }

    const resolution = resolveObjectAccessInheritance({
      flatObjectMetadata,
      flatFieldMetadataMaps: context.flatFieldMetadataMaps,
      flatObjectMetadataMaps: context.flatObjectMetadataMaps,
    });

    if (resolution.status === 'invalid') {
      return authorizedRecordIds;
    }

    const authorizationByParentObjectMetadataId = new Map<
      string,
      ParentAuthorization
    >();

    for (const branch of resolution.branches) {
      for (const column of branch.columns) {
        if (
          authorizationByParentObjectMetadataId.has(
            column.parentObjectMetadataId,
          )
        ) {
          continue;
        }

        const parentIds = [
          ...new Set(
            records
              .map((record) => record[column.joinColumnName])
              .filter((value): value is string => typeof value === 'string'),
          ),
        ];

        authorizationByParentObjectMetadataId.set(
          column.parentObjectMetadataId,
          await this.resolveParentAuthorization({
            parentObjectMetadataId: column.parentObjectMetadataId,
            parentIds,
            context,
            depth,
          }),
        );
      }
    }

    for (const record of records) {
      const recordId = record.id;

      if (typeof recordId !== 'string') {
        continue;
      }

      const branchResults = resolution.branches.map((branch) =>
        this.evaluateBranch({
          branch,
          record,
          authorizationByParentObjectMetadataId,
        }),
      );

      const isAuthorized =
        resolution.match === ObjectAccessInheritanceMatch.ALL
          ? branchResults.every(Boolean)
          : branchResults.some(Boolean);

      if (isAuthorized) {
        authorizedRecordIds.add(recordId);
      }
    }

    return authorizedRecordIds;
  }

  private evaluateBranch({
    branch,
    record,
    authorizationByParentObjectMetadataId,
  }: {
    branch: InheritanceBranch;
    record: Record<string, unknown>;
    authorizationByParentObjectMetadataId: Map<string, ParentAuthorization>;
  }): boolean {
    const populatedColumns = branch.columns.filter(
      (column) => typeof record[column.joinColumnName] === 'string',
    );

    // A valid populated to-one morph carries exactly one concrete parent
    if (populatedColumns.length !== 1) {
      return false;
    }

    const [column] = populatedColumns;
    const parentId = record[column.joinColumnName] as string;

    return (
      authorizationByParentObjectMetadataId
        .get(column.parentObjectMetadataId)
        ?.get(parentId) === true
    );
  }

  // The timeline caches the title of a record it points at through plain uuid
  // columns: the same parent evaluation decides whether that row may be
  // delivered at all
  async resolveAuthorizedLinkedRecordIds({
    linkedRecordIdsByObjectMetadataId,
    context,
  }: {
    linkedRecordIdsByObjectMetadataId: Map<string, string[]>;
    context: InheritedAccessEvaluationContext;
  }): Promise<Map<string, Set<string>>> {
    const authorizedRecordIdsByObjectMetadataId = new Map<
      string,
      Set<string>
    >();

    for (const [
      parentObjectMetadataId,
      parentIds,
    ] of linkedRecordIdsByObjectMetadataId) {
      const authorization = await this.resolveParentAuthorization({
        parentObjectMetadataId,
        parentIds,
        context,
        depth: 0,
      });

      authorizedRecordIdsByObjectMetadataId.set(
        parentObjectMetadataId,
        new Set(
          [...authorization.entries()]
            .filter(([, isAuthorized]) => isAuthorized)
            .map(([parentId]) => parentId),
        ),
      );
    }

    return authorizedRecordIdsByObjectMetadataId;
  }

  private async resolveParentAuthorization({
    parentObjectMetadataId,
    parentIds,
    context,
    depth,
  }: {
    parentObjectMetadataId: string;
    parentIds: string[];
    context: InheritedAccessEvaluationContext;
    depth: number;
  }): Promise<ParentAuthorization> {
    const authorization: ParentAuthorization = new Map();

    if (parentIds.length === 0) {
      return authorization;
    }

    const parentFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: context.flatObjectMetadataMaps,
      flatEntityId: parentObjectMetadataId,
    });

    if (!isDefined(parentFlatObjectMetadata)) {
      return authorization;
    }

    if (
      context.objectsPermissions?.[parentObjectMetadataId]
        ?.canReadObjectRecords === false
    ) {
      return authorization;
    }

    const isOwningApplication =
      isDefined(parentFlatObjectMetadata.applicationId) &&
      context.applicationId === parentFlatObjectMetadata.applicationId;

    const needsParentRecords =
      isDefined(context.isParentRecordMatchingRowLevelPermissions) ||
      (!isOwningApplication &&
        parentFlatObjectMetadata.readability === MetadataReadability.INHERITED);

    const parentRecords = needsParentRecords
      ? await this.fetchRecords({
          workspaceId: context.workspaceId,
          nameSingular: parentFlatObjectMetadata.nameSingular,
          recordIds: parentIds,
        })
      : [];

    const rowLevelAuthorizedIds = needsParentRecords
      ? new Set(
          parentRecords
            .filter(
              (parentRecord) =>
                context.isParentRecordMatchingRowLevelPermissions?.({
                  parentFlatObjectMetadata,
                  parentRecord,
                }) ?? true,
            )
            .map((parentRecord) => parentRecord.id),
        )
      : new Set(parentIds);

    const grantParentIds = (grantedIds: Iterable<string>) => {
      for (const parentId of grantedIds) {
        if (rowLevelAuthorizedIds.has(parentId)) {
          authorization.set(parentId, true);
        }
      }
    };

    if (isOwningApplication) {
      grantParentIds(parentIds);

      return authorization;
    }

    switch (parentFlatObjectMetadata.readability) {
      case MetadataReadability.OPEN:
        grantParentIds(parentIds);

        return authorization;
      case MetadataReadability.SYSTEM:
      case MetadataReadability.APPLICATION:
        return authorization;
      case MetadataReadability.PRIVATE: {
        const recordSharesByRecordId = indexRecordSharesByRecordId(
          await this.recordShareService.findByRecordIds({
            workspaceId: context.workspaceId,
            objectMetadataId: parentObjectMetadataId,
            recordIds: parentIds,
          }),
        );

        grantParentIds(
          parentIds.filter((parentId) =>
            isRecordSharedWithPrincipals({
              recordShareGate: {
                recordSharesByRecordId,
                principalIds: context.principalIds,
              },
              recordId: parentId,
              accessLevels: context.accessLevels,
            }),
          ),
        );

        return authorization;
      }
      case MetadataReadability.INHERITED: {
        grantParentIds(
          await this.resolveAuthorizedRecordIdsAtDepth({
            flatObjectMetadata: parentFlatObjectMetadata,
            records: parentRecords,
            context,
            depth: depth + 1,
          }),
        );

        return authorization;
      }
      default:
        return assertUnreachable(parentFlatObjectMetadata.readability);
    }
  }

  private async fetchRecords({
    workspaceId,
    nameSingular,
    recordIds,
  }: {
    workspaceId: string;
    nameSingular: string;
    recordIds: string[];
  }): Promise<ObjectRecord[]> {
    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager
          .getRepository<ObjectRecord>(
            nameSingular,
            { shouldBypassPermissionChecks: true },
            { shouldSkipEventEmission: true },
          )
          .find({ where: { id: In(recordIds) }, withDeleted: true }),
      buildSystemAuthContext(workspaceId),
    );
  }
}
