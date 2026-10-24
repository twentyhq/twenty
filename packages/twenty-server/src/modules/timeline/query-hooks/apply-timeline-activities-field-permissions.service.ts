import { Injectable, type OnModuleInit } from '@nestjs/common';

import {
  type ObjectRecord,
  type ObjectsPermissions,
} from 'twenty-shared/types';

import { CommonRecordVisibilityService } from 'src/engine/api/common/common-record-visibility/common-record-visibility.service';
import { type RecordVisibilityRestrictionHandler } from 'src/engine/api/common/common-record-visibility/types/record-visibility-restriction-handler.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildReadDeniedFieldNamesAcrossObjects } from 'src/engine/metadata-modules/permissions/utils/build-read-denied-field-names-across-objects.util';
import { omitReadDeniedFieldsFromFieldValueSnapshot } from 'src/engine/metadata-modules/permissions/utils/omit-read-denied-fields-from-field-value-snapshot.util';

@Injectable()
export class ApplyTimelineActivitiesFieldPermissionsService
  implements RecordVisibilityRestrictionHandler, OnModuleInit
{
  constructor(
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
    objectsPermissions,
    flatFieldMetadataMaps,
  }: {
    records: ObjectRecord[];
    objectsPermissions: ObjectsPermissions;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }): Promise<void> {
    const readDeniedFieldNames = buildReadDeniedFieldNamesAcrossObjects({
      objectsPermissions,
      flatFieldMetadataMaps,
    });

    if (readDeniedFieldNames.size === 0) {
      return;
    }

    for (const record of records) {
      if ('properties' in record) {
        record.properties = omitReadDeniedFieldsFromFieldValueSnapshot({
          snapshot: record.properties,
          readDeniedFieldNames,
        });
      }
    }
  }
}
