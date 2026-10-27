import { Injectable } from '@nestjs/common';

import {
  type AppEventSubscription,
  type EventRealtimeScopeManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  EventMetadataException,
  EventMetadataExceptionCode,
} from 'src/engine/metadata-modules/event-metadata/event-metadata.exception';
import { type ResolvedRecordEventSubscription } from 'src/engine/metadata-modules/event-metadata/types/resolved-record-event-subscription.type';
import { buildEventRealtimeChannel } from 'src/engine/metadata-modules/event-metadata/utils/build-event-realtime-channel.util';
import { findApplicationFlatEventMetadataByNameOrThrow } from 'src/engine/metadata-modules/event-metadata/utils/find-application-flat-event-metadata-by-name-or-throw.util';
import { findRecordScopeFlatObjectMetadata } from 'src/engine/metadata-modules/event-metadata/utils/find-record-scope-flat-object-metadata.util';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
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
    subscriptions: AppEventSubscription[];
  }): Promise<ResolvedRecordEventSubscription[]> {
    const { flatEventMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatEventMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    return subscriptions.map(({ event, recordId, property }) => {
      const flatEventMetadata = findApplicationFlatEventMetadataByNameOrThrow({
        flatEventMetadataMaps,
        applicationId,
        name: event,
      });

      const recordScopes = (
        flatEventMetadata.capabilities.realtime?.scopes ?? []
      ).filter(
        (
          scope,
        ): scope is Extract<EventRealtimeScopeManifest, { kind: 'record' }> =>
          scope.kind === 'record' &&
          (!isDefined(property) || scope.property === property),
      );

      if (recordScopes.length !== 1) {
        throw new EventMetadataException(
          isDefined(property)
            ? `Event "${event}" has no record scope on property "${property}"`
            : `Event "${event}" must declare exactly one record scope, or the subscription must name its property`,
          EventMetadataExceptionCode.INVALID_EVENT_SUBSCRIPTION,
        );
      }

      const flatObjectMetadata = findRecordScopeFlatObjectMetadata({
        flatEventMetadata,
        scopeProperty: recordScopes[0].property,
        flatObjectMetadataMaps,
      });

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
