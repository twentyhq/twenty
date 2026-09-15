import { buildFieldIdByNameMaps } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-id-by-name-maps.util';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { type DashboardIdentifierMaps } from 'src/modules/dashboard/tools/types/dashboard-identifier-maps.type';
import {
  type DashboardToolContext,
  type DashboardToolDependencies,
} from 'src/modules/dashboard/tools/types/dashboard-tool-dependencies.type';

export const computeDashboardIdentifierMaps = async (
  deps: Pick<DashboardToolDependencies, 'flatEntityMapsCacheService'>,
  context: DashboardToolContext,
): Promise<DashboardIdentifierMaps> => {
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

  const { fieldIdByObjectIdAndName, fieldById } = buildFieldIdByNameMaps(
    flatFieldMetadataMaps,
  );

  return {
    objectIdByName: { ...idByNamePlural, ...idByNameSingular },
    fieldIdByObjectIdAndName,
    fieldById,
  };
};
