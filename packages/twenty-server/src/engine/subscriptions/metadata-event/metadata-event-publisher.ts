import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { WorkflowVisibility } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { NavigationMenuItemRecordIdentifierService } from 'src/engine/metadata-modules/navigation-menu-item/services/navigation-menu-item-record-identifier.service';
import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';
import { enrichFieldMetadataEventWithRelations } from 'src/engine/subscriptions/metadata-event/utils/enrich-field-metadata-event-with-relations.util';
import { getRequiredPermissionFlagForBroadcastEntityName } from 'src/engine/subscriptions/constants/required-permission-flag-by-broadcast-entity-name.constant';
import { pickBroadcastEventProperties } from 'src/engine/subscriptions/utils/pick-broadcast-event-properties.util';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';

@Injectable()
export class MetadataEventPublisher {
  constructor(
    private readonly workspaceEventBroadcaster: WorkspaceEventBroadcaster,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly navigationMenuItemRecordIdentifierService: NavigationMenuItemRecordIdentifierService,
  ) {}

  async publish(metadataEventBatch: MetadataEventBatch): Promise<void> {
    if (!isNonEmptyArray(metadataEventBatch.events)) {
      return;
    }

    const enrichedBatch =
      await this.enrichMetadataEventBatch(metadataEventBatch);

    const privateWorkflowOwnerByRecordId =
      await this.resolvePrivateWorkflowOwnerByRecordId(enrichedBatch);

    await this.workspaceEventBroadcaster.broadcast({
      workspaceId: enrichedBatch.workspaceId,
      updatedCollectionHash: enrichedBatch.updatedCollectionHash,
      events: enrichedBatch.events.map((event) => {
        const ownerUserWorkspaceId =
          this.resolveOwnerUserWorkspaceId(event) ??
          privateWorkflowOwnerByRecordId.get(event.recordId);

        return {
          type: event.type,
          entityName: event.metadataName,
          recordId: event.recordId,
          properties: pickBroadcastEventProperties({
            entityName: event.metadataName,
            properties: event.properties as Record<string, unknown>,
          }),
          recipientUserWorkspaceIds: isNonEmptyString(ownerUserWorkspaceId)
            ? [ownerUserWorkspaceId]
            : undefined,
          requiredPermissionFlag:
            getRequiredPermissionFlagForBroadcastEntityName(event.metadataName),
        };
      }),
    });
  }

  private resolveOwnerUserWorkspaceId(
    event: MetadataEventBatch['events'][number],
  ): string | undefined {
    if (event.metadataName !== 'navigationMenuItem') {
      return undefined;
    }

    const record = (
      event.type === 'deleted'
        ? event.properties.before
        : event.properties.after
    ) as { userWorkspaceId?: string | null } | undefined;

    return record?.userWorkspaceId ?? undefined;
  }

  // An unowned private workflow stays workspace-wide on purpose: the read path
  // opens it to everyone once its creator has left the workspace.
  private async resolvePrivateWorkflowOwnerByRecordId(
    metadataEventBatch: MetadataEventBatch,
  ): Promise<Map<string, string>> {
    const privateWorkflowOwnerByRecordId = new Map<string, string>();

    if (
      metadataEventBatch.metadataName !== 'workflow' &&
      metadataEventBatch.metadataName !== 'workflowVersion'
    ) {
      return privateWorkflowOwnerByRecordId;
    }

    if (metadataEventBatch.metadataName === 'workflow') {
      for (const event of metadataEventBatch.events) {
        const ownerUserWorkspaceId = this.resolvePrivateWorkflowOwner(
          this.resolveEventRecord(event),
        );

        if (isNonEmptyString(ownerUserWorkspaceId)) {
          privateWorkflowOwnerByRecordId.set(
            event.recordId,
            ownerUserWorkspaceId,
          );
        }
      }

      return privateWorkflowOwnerByRecordId;
    }

    const { flatWorkflowMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId: metadataEventBatch.workspaceId,
          flatMapsKeys: ['flatWorkflowMaps'],
        },
      );

    for (const event of metadataEventBatch.events) {
      const coreWorkflowId = this.resolveEventRecord(event)?.coreWorkflowId;

      if (!isNonEmptyString(coreWorkflowId)) {
        continue;
      }

      const ownerUserWorkspaceId = this.resolvePrivateWorkflowOwner(
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityMaps: flatWorkflowMaps,
          flatEntityId: coreWorkflowId,
        }),
      );

      if (isNonEmptyString(ownerUserWorkspaceId)) {
        privateWorkflowOwnerByRecordId.set(
          event.recordId,
          ownerUserWorkspaceId,
        );
      }
    }

    return privateWorkflowOwnerByRecordId;
  }

  private resolvePrivateWorkflowOwner(
    record:
      | {
          visibility?: WorkflowVisibility | null;
          createdByUserWorkspaceId?: string | null;
        }
      | undefined,
  ): string | undefined {
    return record?.visibility === WorkflowVisibility.PRIVATE
      ? (record.createdByUserWorkspaceId ?? undefined)
      : undefined;
  }

  private resolveEventRecord(event: MetadataEventBatch['events'][number]) {
    return (
      event.type === 'deleted'
        ? event.properties.before
        : event.properties.after
    ) as
      | {
          visibility?: WorkflowVisibility | null;
          createdByUserWorkspaceId?: string | null;
          coreWorkflowId?: string | null;
        }
      | undefined;
  }

  private async enrichMetadataEventBatch(
    metadataEventBatch: MetadataEventBatch,
  ): Promise<MetadataEventBatch> {
    switch (metadataEventBatch.metadataName) {
      case 'fieldMetadata':
        return this.enrichFieldMetadataEventsWithRelations(
          metadataEventBatch as MetadataEventBatch<'fieldMetadata'>,
        );
      case 'navigationMenuItem':
        return this.enrichNavigationMenuItemEventsWithTargetRecordIdentifier(
          metadataEventBatch as MetadataEventBatch<'navigationMenuItem'>,
        );
      default:
        return metadataEventBatch;
    }
  }

  private async enrichFieldMetadataEventsWithRelations(
    metadataEventBatch: MetadataEventBatch<'fieldMetadata'>,
  ): Promise<MetadataEventBatch<'fieldMetadata'>> {
    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId: metadataEventBatch.workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps', 'flatObjectMetadataMaps'],
        },
      );

    const enrichedEvents = metadataEventBatch.events.map((event) => {
      const enrichedProperties = { ...event.properties };

      if (
        'after' in enrichedProperties &&
        isDefined(enrichedProperties.after)
      ) {
        enrichedProperties.after = enrichFieldMetadataEventWithRelations({
          record: enrichedProperties.after as Record<string, unknown>,
          flatFieldMetadataMaps,
          flatObjectMetadataMaps,
        }) as typeof enrichedProperties.after;
      }

      return {
        ...event,
        properties: enrichedProperties,
      } as typeof event;
    });

    return { ...metadataEventBatch, events: enrichedEvents };
  }

  private async enrichNavigationMenuItemEventsWithTargetRecordIdentifier(
    metadataEventBatch: MetadataEventBatch<'navigationMenuItem'>,
  ): Promise<MetadataEventBatch<'navigationMenuItem'>> {
    const enrichedEvents = await Promise.all(
      metadataEventBatch.events.map(async (event) => {
        if (
          !('after' in event.properties) ||
          !isDefined(event.properties.after)
        ) {
          return event;
        }

        const after = event.properties.after as Record<string, unknown>;
        const targetRecordId = after.targetRecordId as string | undefined;
        const targetObjectMetadataId = after.targetObjectMetadataId as
          | string
          | undefined;

        if (!isDefined(targetRecordId) || !isDefined(targetObjectMetadataId)) {
          return event;
        }

        const targetRecordIdentifier =
          await this.navigationMenuItemRecordIdentifierService.resolveRecordIdentifier(
            {
              targetRecordId,
              targetObjectMetadataId,
              workspaceId: metadataEventBatch.workspaceId,
            },
          );

        const enrichedAfter: Record<string, unknown> = {
          ...after,
          targetRecordIdentifier,
        };

        return {
          ...event,
          properties: {
            ...event.properties,
            after: enrichedAfter,
          },
        } as typeof event;
      }),
    );

    return { ...metadataEventBatch, events: enrichedEvents };
  }
}
