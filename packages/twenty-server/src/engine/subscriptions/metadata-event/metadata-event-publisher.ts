import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { NavigationMenuItemRecordIdentifierService } from 'src/engine/metadata-modules/navigation-menu-item/services/navigation-menu-item-record-identifier.service';
import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';
import { enrichFieldMetadataEventWithRelations } from 'src/engine/subscriptions/metadata-event/utils/enrich-field-metadata-event-with-relations.util';
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

    await this.workspaceEventBroadcaster.broadcast({
      workspaceId: enrichedBatch.workspaceId,
      updatedCollectionHash: enrichedBatch.updatedCollectionHash,
      events: enrichedBatch.events.map((event) => {
        const ownerUserWorkspaceId = this.resolveOwnerUserWorkspaceId(event);

        return {
          type: event.type,
          entityName: event.metadataName,
          recordId: event.recordId,
          properties: event.properties as Record<string, unknown>,
          recipientUserWorkspaceIds: isNonEmptyString(ownerUserWorkspaceId)
            ? [ownerUserWorkspaceId]
            : undefined,
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
