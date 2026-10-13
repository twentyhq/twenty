import { type FormatRecordSerializedRelationProperties } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FrontComponentWidgetAvailability } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';

export type UniversalFrontComponentWidgetAvailability =
  FormatRecordSerializedRelationProperties<FrontComponentWidgetAvailability>;

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
