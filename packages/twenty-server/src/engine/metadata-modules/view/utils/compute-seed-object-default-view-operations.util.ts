import {
  getSeededObjectViewUniversalIdentifier,
  getViewFieldUniversalIdentifier,
} from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildSeededViewFieldFlatEntity } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/build-seeded-view-field-flat-entity.util';
import { computeSeededObjectViewToCreate } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-seeded-object-view-to-create.util';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

type SeedInputFlatObjectMetadata = Pick<
  UniversalFlatObjectMetadata,
  'universalIdentifier' | 'labelPlural' | 'isRemote'
>;

type SeedInputFlatView = Pick<
  UniversalFlatView,
  | 'key'
  | 'deletedAt'
  | 'objectMetadataUniversalIdentifier'
  | 'viewFieldUniversalIdentifiers'
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
  flatObjectMetadataMaps: {
    byUniversalIdentifier: Record<
      string,
      SeedInputFlatObjectMetadata | undefined
    >;
  };
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
  flatObjectMetadataMaps,
  flatViewMaps,
  flatViewFieldMaps,
  seededViewApplicationUniversalIdentifier,
}: SeedInputFlatEntityMaps & {
  seededViewApplicationUniversalIdentifier: string;
}): SeedOperations => {
  const seedOperations: SeedOperations = {
    viewsToCreate: [],
    viewFieldsToCreate: [],
  };

  const createdAt = new Date().toISOString();

  const flatIndexViewByObjectUniversalIdentifier = new Map<
    string,
    SeedInputFlatView
  >();

  for (const flatView of Object.values(flatViewMaps.byUniversalIdentifier)) {
    if (
      isDefined(flatView) &&
      flatView.key === ViewKey.INDEX &&
      !isDefined(flatView.deletedAt)
    ) {
      flatIndexViewByObjectUniversalIdentifier.set(
        flatView.objectMetadataUniversalIdentifier,
        flatView,
      );
    }
  }

  for (const flatObjectMetadata of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(flatObjectMetadata) || flatObjectMetadata.isRemote) {
      continue;
    }

    const flatIndexView = flatIndexViewByObjectUniversalIdentifier.get(
      flatObjectMetadata.universalIdentifier,
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
