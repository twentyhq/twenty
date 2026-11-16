import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import {
  compositeTypeDefinitions,
  type ValidationRuleBindings,
} from 'twenty-shared/types';
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
import { PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { RecordFieldPermissionsReadService } from 'src/engine/permissions/record-field-permissions-read.service';
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
    private readonly principalPermissionsReadService: PrincipalPermissionsReadService,
    private readonly recordFieldPermissionsReadService: RecordFieldPermissionsReadService,
  ) {}

  // A hidden field reads as null, which a condition can't tell from an empty one
  private async findFieldHiddenFromTrigger({
    workspaceId,
    application,
    agentId,
    objectMetadataId,
    fieldIds,
  }: {
    workspaceId: string;
    application: FlatApplication;
    agentId?: string;
    objectMetadataId: string;
    fieldIds: string[];
  }): Promise<string | undefined> {
    const principals =
      await this.principalPermissionsReadService.resolvePermissionsPrincipals({
        authContext: {
          type: 'application',
          workspace: { id: workspaceId },
          application,
          agentId,
        },
      });
    const unreadableFieldIds =
      await this.recordFieldPermissionsReadService.findUnreadableFields({
        principals,
        objectMetadataId,
      });
    const unreadableFieldsSQLConditions =
      await this.recordFieldPermissionsReadService.buildUnreadableFieldsSQLConditions(
        { principals, objectMetadataId, tableAlias: 'relatedRecord' },
      );
    const hiddenFieldIds = new Set([
      ...unreadableFieldIds,
      ...unreadableFieldsSQLConditions.flatMap(
        ({ fieldMetadataIds }) => fieldMetadataIds,
      ),
    ]);

    return fieldIds.find((fieldId) => hiddenFieldIds.has(fieldId));
  }

  async filterMatchingEvents<TEvent extends ObjectRecordEvent>({
    workspaceId,
    objectMetadata,
    events,
    eventName,
    watchedFields,
    condition,
    conditionBindings,
    application,
    agentId,
  }: {
    workspaceId: string;
    objectMetadata: FlatObjectMetadata;
    events: TEvent[];
    eventName: string;
    watchedFields?: string[];
    condition?: string;
    conditionBindings?: ValidationRuleBindings;
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
        return {
          errorMessage: `Cannot read the records of "${relationFieldName}"`,
        };
      }

      const targetFields = targetObjectMetadata.fieldIds
        .map((fieldId) =>
          findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: fieldId,
            flatEntityMaps: flatFieldMetadataMaps,
          }),
        )
        .filter(isDefined)
        .filter((field) => fieldNames.includes(field.name));
      const hiddenFieldId = await this.findFieldHiddenFromTrigger({
        workspaceId,
        application,
        agentId,
        objectMetadataId: targetObjectMetadata.id,
        fieldIds: targetFields.map(({ id }) => id),
      });

      if (isDefined(hiddenFieldId)) {
        const hiddenFieldName = targetFields.find(
          ({ id }) => id === hiddenFieldId,
        )?.name;

        return {
          errorMessage: `The condition reads "${relationFieldName}.${hiddenFieldName}", which this trigger cannot always see`,
        };
      }

      const columnNames = targetFields.flatMap((field) => {
        const compositeType = compositeTypeDefinitions.get(field.type);

        return isDefined(compositeType)
          ? compositeType.properties.map((property) =>
              computeCompositeColumnName(field, property),
            )
          : [field.name];
      });

      const relatedRecords =
        await this.workspaceOrmManager.executeInWorkspaceContext(
          () =>
            this.workspaceOrmManager
              .getRepository(targetObjectMetadata.nameSingular)
              .find({
                where: { id: In(recordIds) },
                select: ['id', ...columnNames],
              }),
          buildApplicationAuthContext({ workspace, application, agentId }),
        );

      return { relatedRecords };
    };

    return filterEventsMatchingDatabaseEventTrigger({
      events,
      eventName,
      watchedFields,
      condition,
      conditionBindings,
      fields: buildValidationRuleFieldDescriptors({
        objectMetadataId: objectMetadata.id,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
      findRelatedRecords,
    });
  }
}
