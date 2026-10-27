import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  EventMetadataException,
  EventMetadataExceptionCode,
} from 'src/engine/metadata-modules/event-metadata/event-metadata.exception';
import { type MemberEventSubscriptionInput } from 'src/engine/metadata-modules/event-metadata/types/member-event-subscription-input.type';
import { type ResolvedRecordEventSubscription } from 'src/engine/metadata-modules/event-metadata/types/resolved-record-event-subscription.type';
import { buildEventRealtimeChannel } from 'src/engine/metadata-modules/event-metadata/utils/build-event-realtime-channel.util';
import { findApplicationFlatEventMetadataByName } from 'src/engine/metadata-modules/event-metadata/utils/find-application-flat-event-metadata-by-name.util';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class MemberEventSubscriptionService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async resolveOrThrow({
    workspaceId,
    applicationId,
    subscriptions,
  }: {
    workspaceId: string;
    applicationId: string;
    subscriptions: MemberEventSubscriptionInput[];
  }): Promise<ResolvedRecordEventSubscription[]> {
    const { flatEventMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatEventMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    return subscriptions.map(({ event, recordId, property }) => {
      const flatEventMetadata = findApplicationFlatEventMetadataByName({
        flatEventMetadataMaps,
        applicationId,
        name: event,
      });

      if (!isDefined(flatEventMetadata)) {
        throw new EventMetadataException(
          `Event "${event}" is not declared by this application`,
          EventMetadataExceptionCode.EVENT_METADATA_NOT_FOUND,
        );
      }

      const recordScopes = (
        flatEventMetadata.capabilities.realtime?.scopes ?? []
      ).filter(
        (scope) =>
          scope.kind === 'record' &&
          (!isDefined(property) || scope.property === property),
      );

      if (recordScopes.length !== 1 || recordScopes[0].kind !== 'record') {
        throw new EventMetadataException(
          isDefined(property)
            ? `Event "${event}" has no record scope on property "${property}"`
            : `Event "${event}" must declare exactly one record scope, or the subscription must name its property`,
          EventMetadataExceptionCode.INVALID_EVENT_SUBSCRIPTION,
        );
      }

      const scopeProperty = recordScopes[0].property;
      const referencedProperty = flatEventMetadata.properties.find(
        (eventProperty) => eventProperty.name === scopeProperty,
      );

      const flatObjectMetadata =
        referencedProperty?.type === 'RECORD_REFERENCE'
          ? findFlatEntityByUniversalIdentifier({
              flatEntityMaps: flatObjectMetadataMaps,
              universalIdentifier: referencedProperty.objectUniversalIdentifier,
            })
          : undefined;

      if (!isDefined(flatObjectMetadata)) {
        throw new EventMetadataException(
          `Event "${event}" record scope points at an object that no longer exists`,
          EventMetadataExceptionCode.INVALID_EVENT_SUBSCRIPTION,
        );
      }

      return {
        channel: buildEventRealtimeChannel({
          workspaceId,
          eventMetadataId: flatEventMetadata.id,
          scope: {
            kind: 'record',
            objectMetadataId: flatObjectMetadata.id,
            recordId,
          },
        }),
        objectNameSingular: flatObjectMetadata.nameSingular,
        recordId,
      };
    });
  }

  async canReadAllRecords({
    authContext,
    subscriptions,
  }: {
    authContext: WorkspaceAuthContext;
    subscriptions: ResolvedRecordEventSubscription[];
  }): Promise<boolean> {
    const recordIdsByObjectNameSingular = new Map<string, Set<string>>();

    for (const { objectNameSingular, recordId } of subscriptions) {
      const recordIds =
        recordIdsByObjectNameSingular.get(objectNameSingular) ?? new Set();

      recordIds.add(recordId);
      recordIdsByObjectNameSingular.set(objectNameSingular, recordIds);
    }

    try {
      return await this.workspaceOrmManager.executeInWorkspaceContext(
        async () => {
          for (const [
            objectNameSingular,
            recordIds,
          ] of recordIdsByObjectNameSingular) {
            const readableRecords = await this.workspaceOrmManager
              .getRepositoryWithContextPermissions(objectNameSingular)
              .find({
                where: { id: In([...recordIds]) },
                select: { id: true },
              });

            if (readableRecords.length !== recordIds.size) {
              return false;
            }
          }

          return true;
        },
        authContext,
      );
    } catch (error) {
      if (error instanceof PermissionsException) {
        return false;
      }

      throw error;
    }
  }
}
