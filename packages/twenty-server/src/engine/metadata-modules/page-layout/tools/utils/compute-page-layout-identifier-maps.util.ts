import { buildFieldIdByNameMaps } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-id-by-name-maps.util';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { type PageLayoutIdentifierMaps } from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-identifier-maps.type';
import {
  type PageLayoutToolContext,
  type PageLayoutToolDependencies,
} from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-dependencies.type';

export const computePageLayoutIdentifierMaps = async (
  deps: {
    flatEntityMapsCacheService: Pick<
      PageLayoutToolDependencies['flatEntityMapsCacheService'],
      'getOrRecomputeManyOrAllFlatEntityMaps'
    >;
  },
  context: PageLayoutToolContext,
): Promise<PageLayoutIdentifierMaps> => {
  const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
    await deps.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId: context.workspaceId,
        flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
      },
    );

  const { idByNameSingular, idByNamePlural } = buildObjectIdByNameMaps(
    flatObjectMetadataMaps,
  );

  const { fieldIdByObjectIdAndName } = buildFieldIdByNameMaps(
    flatFieldMetadataMaps,
  );

  return {
    objectIdByName: { ...idByNamePlural, ...idByNameSingular },
    fieldIdByObjectIdAndName,
  };
};
