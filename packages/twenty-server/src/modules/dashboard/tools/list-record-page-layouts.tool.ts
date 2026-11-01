import { z } from 'zod';
import { PageLayoutType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import {
  type DashboardToolContext,
  type DashboardToolDependencies,
} from 'src/modules/dashboard/tools/types/dashboard-tool-dependencies.type';

export const createListRecordPageLayoutsTool = (
  deps: {
    pageLayoutService: Pick<
      DashboardToolDependencies['pageLayoutService'],
      'findBy'
    >;
    flatEntityMapsCacheService: Pick<
      DashboardToolDependencies['flatEntityMapsCacheService'],
      'getOrRecomputeManyOrAllFlatEntityMaps'
    >;
  },
  context: DashboardToolContext,
) => ({
  name: 'list_record_page_layouts' as const,
  description:
    'Find existing record-page layouts and active tabs for an object by its singular or plural name. Returns tab IDs, layout modes and widget positions for place_front_component. These layouts are shared by records of that object.',
  inputSchema: z.object({ objectName: z.string().trim().min(1) }),
  execute: async ({ objectName }: { objectName: string }) => {
    try {
      const { flatObjectMetadataMaps } =
        await deps.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId: context.workspaceId,
            flatMapsKeys: ['flatObjectMetadataMaps'],
          },
        );
      const { idByNameSingular, idByNamePlural } = buildObjectIdByNameMaps(
        flatObjectMetadataMaps,
      );
      const objectMetadataId =
        idByNameSingular[objectName] ?? idByNamePlural[objectName];

      if (!isDefined(objectMetadataId)) {
        throw new Error(`Object "${objectName}" not found`);
      }

      const layouts = await deps.pageLayoutService.findBy({
        workspaceId: context.workspaceId,
        filter: {
          objectMetadataId,
          pageLayoutType: PageLayoutType.RECORD_PAGE,
        },
      });

      return {
        success: true,
        result: {
          layouts: layouts.map(({ id, name, tabs }) => ({
            id,
            name,
            objectMetadataId,
            tabs:
              tabs
                ?.filter((tab) => tab.isActive)
                .map(({ id, title, layoutMode, widgets }) => ({
                  id,
                  title,
                  layoutMode,
                  widgets:
                    widgets?.map(({ id, title, type, position }) => ({
                      id,
                      title,
                      type,
                      position,
                    })) ?? [],
                })) ?? [],
          })),
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
});
