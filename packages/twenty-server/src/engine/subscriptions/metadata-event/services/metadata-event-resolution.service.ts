import { Injectable } from '@nestjs/common';

import { type APP_LOCALES } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { interpolateNavigationCommandMenuItemEvent } from 'src/engine/subscriptions/metadata-event/utils/interpolate-navigation-command-menu-item-event.util';
import { isTranslatableMetadataName } from 'src/engine/subscriptions/metadata-event/utils/is-translatable-metadata-name.util';
import { resolveMetadataEventRecord } from 'src/engine/subscriptions/metadata-event/utils/resolve-metadata-event-record.util';
import { type EventStreamMetadataEvent } from 'src/engine/subscriptions/types/event-stream-metadata-event.type';

const RECORD_KEYS = ['before', 'after'] as const;

const readRecordApplicationId = (
  record: EventStreamMetadataEvent['properties'][(typeof RECORD_KEYS)[number]],
): string | undefined =>
  typeof record?.applicationId === 'string' ? record.applicationId : undefined;

const recordCarriesOverrides = (
  record: EventStreamMetadataEvent['properties'][(typeof RECORD_KEYS)[number]],
): boolean => isDefined(record) && isDefined(record.overrides);

@Injectable()
export class MetadataEventResolutionService {
  constructor(
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async resolveMetadataEvents({
    metadataEvents,
    locale,
    workspaceId,
  }: {
    metadataEvents: EventStreamMetadataEvent[];
    locale: keyof typeof APP_LOCALES | undefined;
    workspaceId: string;
  }): Promise<EventStreamMetadataEvent[]> {
    const translatableEvents = metadataEvents.filter((metadataEvent) =>
      isTranslatableMetadataName(metadataEvent.metadataName),
    );

    const carriesOverrides = metadataEvents.some((metadataEvent) =>
      RECORD_KEYS.some((key) =>
        recordCarriesOverrides(metadataEvent.properties[key]),
      ),
    );

    if (translatableEvents.length === 0 && !carriesOverrides) {
      return metadataEvents;
    }

    const buildI18nContext =
      await this.applicationTranslationCatalogService.getI18nContextByApplicationId(
        {
          applicationIds: translatableEvents.flatMap((metadataEvent) =>
            RECORD_KEYS.map((key) =>
              readRecordApplicationId(metadataEvent.properties[key]),
            ),
          ),
          locale,
          workspaceId,
        },
      );

    const flatObjectMetadataMaps = metadataEvents.some(
      (metadataEvent) => metadataEvent.metadataName === 'commandMenuItem',
    )
      ? (
          await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
            { workspaceId, flatMapsKeys: ['flatObjectMetadataMaps'] },
          )
        ).flatObjectMetadataMaps
      : undefined;

    return metadataEvents.map((metadataEvent) => {
      const { metadataName } = metadataEvent;
      const properties = { ...metadataEvent.properties };

      for (const key of RECORD_KEYS) {
        const record = properties[key];

        if (!isDefined(record)) {
          continue;
        }

        const resolvedRecord = resolveMetadataEventRecord({
          metadataName,
          record,
          i18nContext: buildI18nContext(readRecordApplicationId(record)),
        });

        properties[key] =
          metadataName === 'commandMenuItem' &&
          isDefined(flatObjectMetadataMaps)
            ? interpolateNavigationCommandMenuItemEvent({
                record: resolvedRecord,
                flatObjectMetadataMaps,
                buildI18nContext,
              })
            : resolvedRecord;
      }

      return { ...metadataEvent, properties };
    });
  }
}
