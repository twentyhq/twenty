import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { compositeTypeDefinitions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { buildApplicationAuthContext } from 'src/engine/core-modules/auth/utils/build-application-auth-context.util';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildValidationRuleFieldDescriptors } from 'src/engine/metadata-modules/validation-rule/utils/build-validation-rule-field-descriptors.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type FindDatabaseEventRelatedRecords } from 'src/engine/workspace-event-emitter/types/find-database-event-related-records.type';
import { filterEventsMatchingDatabaseEventTrigger } from 'src/engine/workspace-event-emitter/utils/filter-events-matching-database-event-trigger.util';

@Injectable()
export class DatabaseEventTriggerConditionService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async filterMatchingEvents<TEvent extends ObjectRecordEvent>({
    workspaceId,
    objectMetadata,
    events,
    eventName,
    watchedFields,
    condition,
    application,
    agentId,
  }: {
    workspaceId: string;
    objectMetadata: FlatObjectMetadata;
    events: TEvent[];
    eventName: string;
    watchedFields?: string[];
    condition?: string;
    application: FlatApplication;
    agentId?: string;
  }) {
    if (!isNonEmptyString(condition)) {
      return filterEventsMatchingDatabaseEventTrigger({
        events,
        eventName,
        watchedFields,
        fields: [],
      });
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    // Related records are read as the trigger's owner, so a condition sees no more than its handler could
    const findRelatedRecords: FindDatabaseEventRelatedRecords = async ({
      relationFieldName,
      recordIds,
      fieldNames,
    }) => {
      const relationField = objectMetadata.fieldIds
        .map((fieldId) =>
          findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: fieldId,
            flatEntityMaps: flatFieldMetadataMaps,
          }),
        )
        .find((field) => field?.name === relationFieldName);
      const targetObjectMetadata = isDefined(
        relationField?.relationTargetObjectMetadataId,
      )
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: relationField.relationTargetObjectMetadataId,
            flatEntityMaps: flatObjectMetadataMaps,
          })
        : undefined;
      const workspace = await this.coreEntityCacheService.get(
        'workspaceEntity',
        workspaceId,
      );

      if (!isDefined(targetObjectMetadata) || !isDefined(workspace)) {
        throw new Error(`Cannot read the records of "${relationFieldName}"`);
      }

      // A composite field is stored as one column per subfield (addressCity...)
      const columnNames = targetObjectMetadata.fieldIds
        .map((fieldId) =>
          findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: fieldId,
            flatEntityMaps: flatFieldMetadataMaps,
          }),
        )
        .filter(isDefined)
        .filter((field) => fieldNames.includes(field.name))
        .flatMap((field) => {
          const compositeType = compositeTypeDefinitions.get(field.type);

          return isDefined(compositeType)
            ? compositeType.properties.map((property) =>
                computeCompositeColumnName(field, property),
              )
            : [field.name];
        });

      return this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepository(targetObjectMetadata.nameSingular)
            .find({
              where: { id: In(recordIds) },
              select: ['id', ...columnNames],
            }),
        buildApplicationAuthContext({ workspace, application, agentId }),
      );
    };

    return filterEventsMatchingDatabaseEventTrigger({
      events,
      eventName,
      watchedFields,
      condition,
      fields: buildValidationRuleFieldDescriptors({
        objectMetadataId: objectMetadata.id,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
      findRelatedRecords,
    });
  }
}
