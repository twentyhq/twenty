import { isDefined } from 'twenty-shared/utils';

import { type UniversalFrontComponentWidgetAvailability } from 'src/engine/metadata-modules/flat-front-component/types/universal-front-component-widget-availability.type';
import { type FrontComponentWidgetAvailability } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';

export const fromFrontComponentWidgetAvailabilityToUniversalWidgetAvailability =
  ({
    widgetAvailability,
    objectMetadataUniversalIdentifierById,
  }: {
    widgetAvailability: FrontComponentWidgetAvailability[];
    objectMetadataUniversalIdentifierById: Partial<Record<string, string>>;
  }): UniversalFrontComponentWidgetAvailability[] =>
    widgetAvailability.map(({ objectMetadataId, ...entry }) =>
      isDefined(objectMetadataId)
        ? {
            ...entry,
            objectMetadataUniversalIdentifier:
              objectMetadataUniversalIdentifierById[objectMetadataId] ?? null,
          }
        : entry,
    );
