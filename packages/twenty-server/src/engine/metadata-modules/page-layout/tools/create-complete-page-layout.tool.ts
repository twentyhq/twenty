import { z } from 'zod';

import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

import { type CreatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/create-page-layout-widget.input';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { pageLayoutTabInputSchema } from 'src/engine/metadata-modules/page-layout/tools/schemas/page-layout-tab-input.schema';
import { pageLayoutTypeSchema } from 'src/engine/metadata-modules/page-layout/tools/schemas/page-layout-type.schema';
import { type PageLayoutToolContext } from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-context.type';
import { type PageLayoutToolDependencies } from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-dependencies.type';
import { deriveGridPositionForWidget } from 'src/engine/metadata-modules/page-layout/tools/utils/derive-grid-position-for-widget.util';

const createCompletePageLayoutSchema = z.object({
  name: z.string().describe('Layout name'),
  type: pageLayoutTypeSchema
    .optional()
    .default(PageLayoutType.RECORD_PAGE)
    .describe(
      'Layout type. RECORD_PAGE is the typical choice for object detail pages.',
    ),
  objectMetadataId: z
    .string()
    .uuid()
    .optional()
    .describe(
      'Object the layout is for. Required for RECORD_PAGE and RECORD_INDEX.',
    ),
  tabs: z
    .array(pageLayoutTabInputSchema)
    .min(1)
    .describe(
      'At least one tab. Each tab has a title and an optional list of widgets.',
    ),
});

type CreateCompletePageLayoutParams = z.infer<
  typeof createCompletePageLayoutSchema
>;

export const createCreateCompletePageLayoutTool = (
  deps: PageLayoutToolDependencies,
  context: PageLayoutToolContext,
) => ({
  name: 'create_complete_page_layout' as const,
  description: `Create a complete page layout with tabs and widgets in one shot.

Best used for new record-page or standalone-page layouts. For dashboards, prefer the existing create_complete_dashboard tool (it wires up the Dashboard record too).

Widget configuration shape varies by widget type — see add_page_layout_widget for the per-type reference. Errors on individual widgets are surfaced in the response without aborting the rest.`,
  inputSchema: createCompletePageLayoutSchema,
  execute: async (parameters: CreateCompletePageLayoutParams) => {
    try {
      const layout = await deps.pageLayoutService.create({
        createPageLayoutInput: {
          name: parameters.name,
          type: parameters.type as PageLayoutType,
          objectMetadataId: parameters.objectMetadataId,
        },
        workspaceId: context.workspaceId,
      });

      const createdTabs: Array<{
        id: string;
        title: string;
        widgetCount: number;
      }> = [];
      const widgetErrors: Array<{ widgetTitle: string; error: string }> = [];

      for (const [index, tabInput] of parameters.tabs.entries()) {
        const tab = await deps.pageLayoutTabService.create({
          createPageLayoutTabInput: {
            title: tabInput.title,
            pageLayoutId: layout.id,
            position: tabInput.position ?? index,
            layoutMode:
              (tabInput.layoutMode as PageLayoutTabLayoutMode | undefined) ??
              undefined,
          },
          workspaceId: context.workspaceId,
        });

        const widgetsForTab = tabInput.widgets ?? [];
        let createdWidgetCount = 0;

        for (const widget of widgetsForTab) {
          try {
            await deps.pageLayoutWidgetService.create({
              input: {
                title: widget.title,
                type: widget.type,
                objectMetadataId: widget.objectMetadataId ?? null,
                configuration: widget.configuration,
                position: widget.position,
                gridPosition: deriveGridPositionForWidget(widget.position),
                pageLayoutTabId: tab.id,
              } as unknown as CreatePageLayoutWidgetInput,
              workspaceId: context.workspaceId,
            });
            createdWidgetCount += 1;
          } catch (widgetError) {
            const errMessage =
              widgetError instanceof Error
                ? widgetError.message
                : String(widgetError);

            widgetErrors.push({ widgetTitle: widget.title, error: errMessage });
          }
        }

        createdTabs.push({
          id: tab.id,
          title: tab.title,
          widgetCount: createdWidgetCount,
        });
      }

      return {
        success: true,
        message:
          widgetErrors.length > 0
            ? `Page layout created. ${widgetErrors.length} widget(s) failed.`
            : `Page layout "${parameters.name}" created`,
        result: {
          pageLayoutId: layout.id,
          name: layout.name,
          tabs: createdTabs,
        },
        ...(widgetErrors.length > 0 && { widgetErrors }),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to create page layout: ${message}`,
        error: message,
      };
    }
  },
});
