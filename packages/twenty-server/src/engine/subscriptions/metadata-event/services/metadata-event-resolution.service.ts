import { Injectable } from '@nestjs/common';

import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/utils/effective-entity-i18n-context.type';
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

const EMPTY_CATALOGS = {
  standardApplicationId: undefined,
  catalogByApplicationId: new Map<string, never>(),
};

@Injectable()
export class MetadataEventResolutionService {
  constructor(
    private readonly i18nService: I18nService,
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

    const safeLocale = locale ?? SOURCE_LOCALE;

    const { standardApplicationId, catalogByApplicationId } =
      translatableEvents.length > 0
        ? await this.applicationTranslationCatalogService.getCatalogs({
            applicationIds: translatableEvents.flatMap((metadataEvent) =>
              RECORD_KEYS.map((key) =>
                readRecordApplicationId(metadataEvent.properties[key]),
              ),
            ),
            locale: safeLocale,
            workspaceId,
          })
        : EMPTY_CATALOGS;

    const i18nInstance = this.i18nService.getI18nInstance(safeLocale);

    const buildI18nContext = (
      applicationId: string | undefined,
    ): EffectiveEntityI18nContext => ({
      locale,
      i18nInstance,
      isStandardApp: applicationId === standardApplicationId,
      applicationCatalog: isDefined(applicationId)
        ? catalogByApplicationId.get(applicationId)
        : undefined,
    });

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
