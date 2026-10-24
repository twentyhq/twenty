import { Injectable, type OnModuleInit } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type ObjectRecord, type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { CommonRecordVisibilityService } from 'src/engine/api/common/common-record-visibility/common-record-visibility.service';
import { type RecordVisibilityRestrictionHandler } from 'src/engine/api/common/common-record-visibility/types/record-visibility-restriction-handler.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type ResolvedFieldValueSnapshotField } from 'src/engine/metadata-modules/permissions/types/resolved-field-value-snapshot-field.type';
import { buildReadDeniedFieldNamesForObject } from 'src/engine/metadata-modules/permissions/utils/build-read-denied-field-names-for-object.util';
import { omitReadDeniedFieldsFromFieldValueSnapshot } from 'src/engine/metadata-modules/permissions/utils/omit-read-denied-fields-from-field-value-snapshot.util';
import { resolveFieldValueSnapshotFields } from 'src/engine/metadata-modules/permissions/utils/resolve-field-value-snapshot-fields.util';
import { resolveFieldValueSnapshotSubjectObjectMetadataId } from 'src/engine/metadata-modules/permissions/utils/resolve-field-value-snapshot-subject-object-metadata-id.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

const hasSubjectColumns = ({
  record,
  snapshotField,
}: {
  record: ObjectRecord;
  snapshotField: ResolvedFieldValueSnapshotField;
}): boolean =>
  snapshotField.subjectObjectMetadataIdFieldName in record &&
  snapshotField.subjectJoinColumns.every(
    ({ joinColumnName }) => joinColumnName in record,
  );

@Injectable()
export class ApplyTimelineActivitiesFieldPermissionsService
  implements RecordVisibilityRestrictionHandler, OnModuleInit
{
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly commonRecordVisibilityService: CommonRecordVisibilityService,
  ) {}

  onModuleInit() {
    this.commonRecordVisibilityService.registerHandler({
      objectNameSingular: 'timelineActivity',
      handler: this,
    });
  }

  public async applyVisibilityRestrictions({
    records,
    authContext,
    objectsPermissions,
    flatFieldMetadataMaps,
  }: {
    records: ObjectRecord[];
    authContext: WorkspaceAuthContext;
    objectsPermissions: ObjectsPermissions;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }): Promise<void> {
    const propertiesField = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        STANDARD_OBJECTS.timelineActivity.fields.properties.universalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(propertiesField)) {
      return;
    }

    const [snapshotField] = resolveFieldValueSnapshotFields({
      objectMetadataId: propertiesField.objectMetadataId,
      flatFieldMetadataMaps,
    });

    if (!isDefined(snapshotField)) {
      return;
    }

    const recordsWithProperties = records.filter(
      (record) => snapshotField.snapshotFieldName in record,
    );

    if (recordsWithProperties.length === 0) {
      return;
    }

    const storedRecordById = await this.findStoredRecordsMissingSubjectColumns({
      records: recordsWithProperties,
      snapshotField,
      workspaceId: authContext.workspace.id,
    });

    for (const record of recordsWithProperties) {
      const subjectObjectMetadataId =
        resolveFieldValueSnapshotSubjectObjectMetadataId({
          record: storedRecordById.get(record.id) ?? record,
          snapshotField,
        });

      if (!isDefined(subjectObjectMetadataId)) {
        continue;
      }

      record[snapshotField.snapshotFieldName] =
        omitReadDeniedFieldsFromFieldValueSnapshot({
          snapshot: record[snapshotField.snapshotFieldName],
          readDeniedFieldNames: buildReadDeniedFieldNamesForObject({
            objectMetadataId: subjectObjectMetadataId,
            objectsPermissions,
            flatFieldMetadataMaps,
          }),
        });
    }
  }

  private async findStoredRecordsMissingSubjectColumns({
    records,
    snapshotField,
    workspaceId,
  }: {
    records: ObjectRecord[];
    snapshotField: ResolvedFieldValueSnapshotField;
    workspaceId: string;
  }): Promise<Map<string, ObjectRecord>> {
    const recordIdsMissingSubjectColumns = records
      .filter((record) => !hasSubjectColumns({ record, snapshotField }))
      .map((record) => record.id)
      .filter(isDefined);

    if (recordIdsMissingSubjectColumns.length === 0) {
      return new Map();
    }

    const storedRecords = await this.workspaceOrmManager.executeInWorkspaceContext(
      async () =>
        this.workspaceOrmManager
          .getRepository<ObjectRecord>('timelineActivity', {
            shouldBypassPermissionChecks: true,
          })
          .find({ where: { id: In(recordIdsMissingSubjectColumns) } }),
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );

    return new Map(storedRecords.map((record) => [record.id, record]));
  }
}
