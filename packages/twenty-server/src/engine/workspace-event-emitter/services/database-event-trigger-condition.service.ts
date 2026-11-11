import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { compositeTypeDefinitions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { buildSystemAuthContext } from 'src/engine/core-modules/auth/utils/build-system-auth-context.util';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildValidationRuleFieldDescriptors } from 'src/engine/metadata-modules/validation-rule/utils/build-validation-rule-field-descriptors.util';
import { PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { RecordFieldPermissionsReadService } from 'src/engine/permissions/record-field-permissions-read.service';
import { RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';
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
    private readonly recordPermissionsReadService: RecordPermissionsReadService,
  ) {}

  // A hidden field reads as null, which a condition can't tell from an empty one
  private async findFieldHiddenFromTrigger({
    principals,
    objectMetadataId,
    fieldIds,
  }: {
    principals: PermissionsPrincipalsWithRolesContext;
    objectMetadataId: string;
    fieldIds: string[];
  }): Promise<string | undefined> {
    const unreadableFieldIds =
      await this.recordFieldPermissionsReadService.findUnreadableFields({
        principals,
        objectMetadataId,
      });
    const fieldsHiddenOnMatchingRecords =
      await this.recordFieldPermissionsReadService.findFieldsHiddenOnMatchingRecords(
        { principals, objectMetadataId, tableAlias: 'relatedRecord' },
      );
    const hiddenFieldIds = new Set([
      ...unreadableFieldIds,
      ...fieldsHiddenOnMatchingRecords.flatMap(
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
    authContext,
  }: {
    workspaceId: string;
    objectMetadata: FlatObjectMetadata;
    events: TEvent[];
    eventName: string;
    watchedFields?: string[];
    condition?: string | null;
    authContext: PermissionsAuthContext;
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

    // Related records are read as the trigger's principal, so a condition sees no more than its handler could
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

      const principals =
        await this.principalPermissionsReadService.resolvePermissionsPrincipals(
          { authContext },
        );

      if (
        !isDefined(targetObjectMetadata) ||
        !isDefined(workspace) ||
        !isDefined(principals)
      ) {
        throw new Error(`Cannot read the records of "${relationFieldName}"`);
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
        principals,
        objectMetadataId: targetObjectMetadata.id,
        fieldIds: targetFields.map(({ id }) => id),
      });

      if (isDefined(hiddenFieldId)) {
        const hiddenFieldName = targetFields.find(
          ({ id }) => id === hiddenFieldId,
        )?.name;

        throw new Error(
          `The condition reads "${relationFieldName}.${hiddenFieldName}", which this trigger cannot always see`,
        );
      }

      const canReadTargetRecords =
        await this.recordPermissionsReadService.canAccessSomeRecords({
          principals,
          objectMetadataId: targetObjectMetadata.id,
          operationType: 'read',
        });

      if (!canReadTargetRecords) {
        throw new Error(
          `The condition reads "${relationFieldName}", which this trigger cannot see`,
        );
      }

      const columnNames = targetFields.flatMap((field) => {
        const compositeType = compositeTypeDefinitions.get(field.type);

        return isDefined(compositeType)
          ? compositeType.properties.map((property) =>
              computeCompositeColumnName(field, property),
            )
          : [field.name];
      });

      // The ORM can't read as a webhook, so records are filtered by the principal's grants instead
      const relatedRecords =
        await this.workspaceOrmManager.executeInWorkspaceContext(
          () =>
            this.workspaceOrmManager
              .getRepositoryWithoutPermissionChecks(
                targetObjectMetadata.nameSingular,
              )
              .find({
                where: { id: In(recordIds) },
                select: ['id', ...columnNames],
              }),
          buildSystemAuthContext({ workspace }),
        );
      const readableRecordIds =
        await this.recordPermissionsReadService.filterGrantedRecordIds({
          principals,
          objectMetadataId: targetObjectMetadata.id,
          operationType: 'read',
          recordIds: relatedRecords.map(({ id }) => id),
        });

      return relatedRecords.filter(({ id }) =>
        readableRecordIds.has(id.toLowerCase()),
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
