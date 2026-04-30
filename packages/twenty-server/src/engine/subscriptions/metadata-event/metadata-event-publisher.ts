import { Injectable } from '@nestjs/common';

import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { NavigationMenuItemRecordIdentifierService } from 'src/engine/metadata-modules/navigation-menu-item/services/navigation-menu-item-record-identifier.service';
import { OBJECT_METADATA_STANDARD_OVERRIDES_PROPERTIES } from 'src/engine/metadata-modules/object-metadata/constants/object-metadata-standard-overrides-properties.constant';
import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { enrichCommandMenuItemEventWithResolvedNavigation } from 'src/engine/subscriptions/metadata-event/utils/enrich-command-menu-item-event-with-resolved-navigation.util';
import { enrichFieldMetadataEventWithRelations } from 'src/engine/subscriptions/metadata-event/utils/enrich-field-metadata-event-with-relations.util';
import { resolveOverridableEntityEventBatchOverrides } from 'src/engine/subscriptions/metadata-event/utils/sanitize-overridable-entity-event-batch.util';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';

@Injectable()
export class MetadataEventPublisher {
  constructor(
    private readonly workspaceEventBroadcaster: WorkspaceEventBroadcaster,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly navigationMenuItemRecordIdentifierService: NavigationMenuItemRecordIdentifierService,
    private readonly i18nService: I18nService,
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
      events: enrichedBatch.events.map((event) => ({
        type: event.type,
        entityName: event.metadataName,
        recordId: event.recordId,
        properties: event.properties as Record<string, unknown>,
      })),
    });
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
      case 'commandMenuItem':
        return this.enrichCommandMenuItemEventsWithResolvedNavigation(
          metadataEventBatch as MetadataEventBatch<'commandMenuItem'>,
        );
      case 'objectMetadata':
        return this.resolveObjectMetadataStandardOverrides(
          metadataEventBatch as MetadataEventBatch<'objectMetadata'>,
        );
      default:
        return resolveOverridableEntityEventBatchOverrides(metadataEventBatch);
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
      if (
        !('after' in event.properties) ||
        !isDefined(event.properties.after)
      ) {
        return event;
      }

      const enrichedAfter = enrichFieldMetadataEventWithRelations({
        record: event.properties.after as Record<string, unknown>,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
      });

      return {
        ...event,
        properties: {
          ...event.properties,
          after: enrichedAfter,
        },
      } as typeof event;
    });

    return { ...metadataEventBatch, events: enrichedEvents };
  }

  private async enrichCommandMenuItemEventsWithResolvedNavigation(
    metadataEventBatch: MetadataEventBatch<'commandMenuItem'>,
  ): Promise<MetadataEventBatch<'commandMenuItem'>> {
    const { flatObjectMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId: metadataEventBatch.workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const i18nInstance = this.i18nService.getI18nInstance(SOURCE_LOCALE);

    const enrichedEvents = metadataEventBatch.events.map((event) => {
      if (
        !('after' in event.properties) ||
        !isDefined(event.properties.after)
      ) {
        return event;
      }

      const enrichedAfter = enrichCommandMenuItemEventWithResolvedNavigation({
        record: event.properties.after as FlatCommandMenuItem,
        flatObjectMetadataMaps,
        locale: SOURCE_LOCALE,
        i18nInstance,
      });

      return {
        ...event,
        properties: {
          ...event.properties,
          after: enrichedAfter,
        },
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

  private resolveObjectMetadataStandardOverrides(
    metadataEventBatch: MetadataEventBatch<'objectMetadata'>,
  ): MetadataEventBatch<'objectMetadata'> {
    const enrichedEvents = metadataEventBatch.events.map((event) => {
      const enrichedProperties = { ...event.properties };

      if (
        'before' in enrichedProperties &&
        isDefined(enrichedProperties.before)
      ) {
        enrichedProperties.before =
          this.applyStandardOverridesToObjectMetadataRecord(
            enrichedProperties.before as Record<string, unknown>,
          ) as typeof enrichedProperties.before;
      }

      if (
        'after' in enrichedProperties &&
        isDefined(enrichedProperties.after)
      ) {
        enrichedProperties.after =
          this.applyStandardOverridesToObjectMetadataRecord(
            enrichedProperties.after as Record<string, unknown>,
          ) as typeof enrichedProperties.after;
      }

      return { ...event, properties: enrichedProperties } as typeof event;
    });

    return { ...metadataEventBatch, events: enrichedEvents };
  }

  private applyStandardOverridesToObjectMetadataRecord(
    record: Record<string, unknown>,
  ): Record<string, unknown> {
    const standardOverrides = record.standardOverrides as
      | Record<string, unknown>
      | null
      | undefined;

    if (!isDefined(standardOverrides)) {
      return record;
    }

    const resolved = { ...record };

    for (const key of OBJECT_METADATA_STANDARD_OVERRIDES_PROPERTIES) {
      if (isDefined(standardOverrides[key])) {
        resolved[key] = standardOverrides[key];
      }
    }

    return resolved;
  }
}
