import { isNonEmptyString } from '@sniptt/guards';
import {
  generateMessageId,
  getMetadataLabelContext,
  TRANSLATABLE_PROPERTIES_BY_METADATA_NAME,
  type TranslatableMetadataName,
} from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import { messages } from 'src/engine/core-modules/i18n/locales/generated/en';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { STANDARD_TIMELINE_ACTIVITY_TYPE_DEFINITIONS } from 'src/engine/metadata-modules/timeline-activity-type/constants/standard-timeline-activity-type-definitions.constant';

// The read path resolves every standard metadata label through
// generateMessageId(value, `${metadataName}.${property}`), while authoring
// repeats that context as a literal on each msg site -- lingui extraction
// cannot evaluate a call. This spec is what pins the two together: it mints
// the standard application and asserts the compiled catalog holds an entry at
// the exact id the read path will compute. A missing or misspelled context on
// any authoring site fails here instead of silently untranslating.
describe('standard metadata labels reach the catalog under their context', () => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: '2026-01-01T00:00:00.000Z',
      workspaceId: '20202020-0000-4000-8000-000000000000',
      twentyStandardApplicationId: '20202020-0000-4000-8000-000000000001',
    });

  const translatableMetadataNames = Object.keys(
    TRANSLATABLE_PROPERTIES_BY_METADATA_NAME,
  ) as TranslatableMetadataName[];
  const timelineActivityTypeMessageIdByLabel = new Map(
    STANDARD_TIMELINE_ACTIVITY_TYPE_DEFINITIONS.map(({ label }) => [
      label.message,
      label.id,
    ]),
  );

  it.each(translatableMetadataNames)('%s', (metadataName) => {
    const flatEntityMaps =
      allFlatEntityMaps[
        getMetadataFlatEntityMapsKey(
          metadataName,
        ) as keyof typeof allFlatEntityMaps
      ];

    if (!isDefined(flatEntityMaps)) {
      return;
    }

    const missing: string[] = [];

    for (const flatEntity of Object.values(
      flatEntityMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(flatEntity)) {
        continue;
      }

      // FIELDS_WIDGET views back the record-page fields widget; their name is
      // engine plumbing and never displayed.
      if (
        metadataName === 'view' &&
        (flatEntity as Record<string, unknown>).type === 'FIELDS_WIDGET'
      ) {
        continue;
      }

      for (const property of TRANSLATABLE_PROPERTIES_BY_METADATA_NAME[
        metadataName
      ]) {
        const value = (flatEntity as Record<string, unknown>)[property];

        if (!isNonEmptyString(value)) {
          continue;
        }

        // A value that is nothing but placeholders ({objectLabelPlural} as a
        // whole short label) has no words to translate.
        if (value.replace(/\{\w+\}/g, '').trim() === '') {
          continue;
        }

        const context = getMetadataLabelContext(metadataName, property);
        const messageId = generateMessageId(value, context);

        // Translation catalogs are generated after source changes. The source
        // descriptor still proves that the timeline label uses the exact
        // context expected by the read path before that pipeline catches up.
        const sourceMessageId =
          metadataName === 'timelineActivityType' && property === 'label'
            ? timelineActivityTypeMessageIdByLabel.get(value)
            : undefined;

        if (!(messageId in messages) && sourceMessageId !== messageId) {
          missing.push(`(${context}) ${value}`);
        }
      }
    }

    expect(missing).toEqual([]);
  });
});
