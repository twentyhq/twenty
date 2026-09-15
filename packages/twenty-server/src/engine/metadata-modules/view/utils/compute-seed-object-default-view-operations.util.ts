import {
  getSeededObjectViewUniversalIdentifier,
  getViewFieldUniversalIdentifier,
} from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildSeededViewFieldFlatEntity } from 'src/engine/metadata-modules/view/utils/build-seeded-view-field-flat-entity.util';
import { computeSeededObjectViewToCreate } from 'src/engine/metadata-modules/view/utils/compute-seeded-object-view-to-create.util';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

type SeedInputFlatObjectMetadata = Pick<
  UniversalFlatObjectMetadata,
  | 'universalIdentifier'
  | 'labelPlural'
  | 'isRemote'
  | 'viewUniversalIdentifiers'
>;

type SeedInputFlatView = Pick<
  UniversalFlatView,
  'key' | 'deletedAt' | 'viewFieldUniversalIdentifiers'
>;

type SeedInputFlatViewField = Pick<
  UniversalFlatViewField,
  | 'fieldMetadataUniversalIdentifier'
  | 'isVisible'
  | 'size'
  | 'position'
  | 'aggregateOperation'
  | 'isActive'
>;

type SeedInputFlatEntityMaps = {
  flatViewMaps: {
    byUniversalIdentifier: Record<string, SeedInputFlatView | undefined>;
  };
  flatViewFieldMaps: {
    byUniversalIdentifier: Record<string, SeedInputFlatViewField | undefined>;
  };
};

export type SeedOperations = {
  viewsToCreate: UniversalFlatView[];
  viewFieldsToCreate: UniversalFlatViewField[];
};

export const computeSeedObjectDefaultViewOperations = ({
  flatObjectMetadatas,
  flatViewMaps,
  flatViewFieldMaps,
  seededViewApplicationUniversalIdentifier,
}: SeedInputFlatEntityMaps & {
  flatObjectMetadatas: SeedInputFlatObjectMetadata[];
  seededViewApplicationUniversalIdentifier: string;
}): SeedOperations => {
  const seedOperations: SeedOperations = {
    viewsToCreate: [],
    viewFieldsToCreate: [],
  };

  const createdAt = new Date().toISOString();

  for (const flatObjectMetadata of flatObjectMetadatas) {
    if (flatObjectMetadata.isRemote) {
      continue;
    }

    const flatIndexView = flatObjectMetadata.viewUniversalIdentifiers
      .map(
        (viewUniversalIdentifier) =>
          flatViewMaps.byUniversalIdentifier[viewUniversalIdentifier],
      )
      .find(
        (flatView) =>
          isDefined(flatView) &&
          flatView.key === ViewKey.INDEX &&
          !isDefined(flatView.deletedAt),
      );

    if (!isDefined(flatIndexView)) {
      continue;
    }

    const seededViewUniversalIdentifier =
      getSeededObjectViewUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier:
          seededViewApplicationUniversalIdentifier,
        objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      });

    const existingSeededFlatView =
      flatViewMaps.byUniversalIdentifier[seededViewUniversalIdentifier];

    if (
      isDefined(existingSeededFlatView) &&
      isDefined(existingSeededFlatView.deletedAt)
    ) {
      continue;
    }

    const existingSeededViewFieldUniversalIdentifiers = new Set(
      existingSeededFlatView?.viewFieldUniversalIdentifiers ?? [],
    );

    if (!isDefined(existingSeededFlatView)) {
      seedOperations.viewsToCreate.push(
        computeSeededObjectViewToCreate({
          objectMetadata: flatObjectMetadata,
          applicationUniversalIdentifier:
            seededViewApplicationUniversalIdentifier,
        }),
      );
    }

    for (const viewFieldUniversalIdentifier of flatIndexView.viewFieldUniversalIdentifiers) {
      const flatViewField =
        flatViewFieldMaps.byUniversalIdentifier[viewFieldUniversalIdentifier];

      if (!isDefined(flatViewField)) {
        continue;
      }

      const seededViewFieldUniversalIdentifier =
        getViewFieldUniversalIdentifier({
          applicationUniversalIdentifier:
            seededViewApplicationUniversalIdentifier,
          viewUniversalIdentifier: seededViewUniversalIdentifier,
          fieldMetadataUniversalIdentifier:
            flatViewField.fieldMetadataUniversalIdentifier,
        });

      if (
        existingSeededViewFieldUniversalIdentifiers.has(
          seededViewFieldUniversalIdentifier,
        )
      ) {
        continue;
      }

      seedOperations.viewFieldsToCreate.push(
        buildSeededViewFieldFlatEntity({
          applicationUniversalIdentifier:
            seededViewApplicationUniversalIdentifier,
          seededViewUniversalIdentifier,
          fieldMetadataUniversalIdentifier:
            flatViewField.fieldMetadataUniversalIdentifier,
          isVisible: flatViewField.isVisible,
          size: flatViewField.size,
          position: flatViewField.position,
          aggregateOperation: flatViewField.aggregateOperation,
          isActive: flatViewField.isActive,
          createdAt,
        }),
      );
    }
  }

  return seedOperations;
};
