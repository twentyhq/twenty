import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';
import { PageLayoutType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type PageLayoutWidgetDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/page-layout-widget.dto';
import { type PageLayoutTabDTO } from 'src/engine/metadata-modules/page-layout-tab/dtos/page-layout-tab.dto';
import { type PageLayoutDTO } from 'src/engine/metadata-modules/page-layout/dtos/page-layout.dto';
import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { PAGE_LAYOUT_READ_ACCESS_POLICY } from 'src/engine/metadata-modules/page-layout/constants/page-layout-read-access-policy.constant';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { getObjectMetadataIdByName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-object-metadata-id-by-name.util';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';

type RecordPageLayoutResult = Pick<PageLayoutDTO, 'id' | 'name'> & {
  objectMetadataId: string;
  tabs: (Pick<PageLayoutTabDTO, 'id' | 'title' | 'layoutMode'> & {
    widgets: Pick<PageLayoutWidgetDTO, 'id' | 'title' | 'type' | 'position'>[];
  })[];
};

const listRecordPageLayoutsSchema = z.object({
  objectName: z.string().trim().min(1),
});

@DefineTool({
  name: 'list_record_page_layouts',
  description:
    'Find existing record-page layouts and active tabs for an object by its singular or plural name. Returns tab IDs, layout modes and widget positions for place_front_component. These layouts are shared by records of that object.',
  category: ToolCategory.PAGE_LAYOUT,
  accessPolicy: PAGE_LAYOUT_READ_ACCESS_POLICY,
  icon: 'IconAppWindow',
})
export class ListRecordPageLayoutsTool extends BaseTool<
  typeof listRecordPageLayoutsSchema
> {
  readonly inputSchema = listRecordPageLayoutsSchema;

  constructor(
    private readonly pageLayoutService: PageLayoutService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {
    super();
  }

  async execute({
    input: parameters,
    context,
  }: ToolExecuteArgs<typeof listRecordPageLayoutsSchema>): Promise<
    ToolOutput<{ layouts: RecordPageLayoutResult[] }>
  > {
    try {
      const { flatObjectMetadataMaps } =
        await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId: context.workspaceId,
            flatMapsKeys: ['flatObjectMetadataMaps'],
          },
        );
      const objectMetadataId = getObjectMetadataIdByName({
        flatObjectMetadataMaps,
        objectName: parameters.objectName,
      });

      if (!isDefined(objectMetadataId)) {
        throw new PageLayoutException(
          `Object "${parameters.objectName}" not found`,
          PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
        );
      }

      const layouts = await this.pageLayoutService.findBy({
        workspaceId: context.workspaceId,
        filter: {
          objectMetadataId,
          pageLayoutType: PageLayoutType.RECORD_PAGE,
        },
      });

      return {
        success: true,
        message: `Found ${layouts.length} record-page layout(s)`,
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
      return {
        success: false,
        message: `Failed to list record-page layouts: ${error.message}`,
        error: error.message,
      };
    }
  }
}
