import { PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-shared/types';

import { createListRecordPageLayoutsTool } from 'src/engine/metadata-modules/page-layout/tools/list-record-page-layouts.tool';

const buildDependencies = () => ({
  flatEntityMapsCacheService: {
    getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
      flatObjectMetadataMaps: {
        byUniversalIdentifier: {
          company: {
            id: 'company',
            nameSingular: 'company',
            namePlural: 'companies',
          },
        },
      },
    }),
  },
  pageLayoutService: {
    findBy: jest.fn().mockResolvedValue([
      {
        id: 'layout',
        name: 'Company',
        tabs: [
          {
            id: 'tab',
            title: 'Overview',
            isActive: true,
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            widgets: [
              {
                id: 'widget',
                title: 'Existing',
                type: 'FRONT_COMPONENT',
                position: {
                  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                  index: 0,
                },
              },
            ],
          },
          { id: 'inactive-tab', isActive: false },
        ],
      },
    ]),
  },
});

describe('list_record_page_layouts', () => {
  it.each(['company', 'companies'])(
    'finds layouts by object name %s and returns only active tabs',
    async (objectName) => {
      const dependencies = buildDependencies();
      const tool = createListRecordPageLayoutsTool({
        deps: dependencies,
        context: { workspaceId: 'workspace' },
      });
      const result = await tool.execute({ objectName });
      expect(
        dependencies.flatEntityMapsCacheService
          .getOrRecomputeManyOrAllFlatEntityMaps,
      ).toHaveBeenCalledTimes(1);
      expect(
        dependencies.flatEntityMapsCacheService
          .getOrRecomputeManyOrAllFlatEntityMaps,
      ).toHaveBeenCalledWith({
        workspaceId: 'workspace',
        flatMapsKeys: ['flatObjectMetadataMaps'],
      });
      expect(dependencies.pageLayoutService.findBy).toHaveBeenCalledTimes(1);
      expect(dependencies.pageLayoutService.findBy).toHaveBeenCalledWith({
        workspaceId: 'workspace',
        filter: {
          objectMetadataId: 'company',
          pageLayoutType: PageLayoutType.RECORD_PAGE,
        },
      });
      expect(result).toMatchObject({
        success: true,
        result: {
          layouts: [
            {
              id: 'layout',
              objectMetadataId: 'company',
              tabs: [
                {
                  id: 'tab',
                  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                  widgets: [{ id: 'widget', position: { index: 0 } }],
                },
              ],
            },
          ],
        },
      });
      expect(result.result?.layouts[0].tabs).toHaveLength(1);
    },
  );

  it('preserves grid coordinates and spans', async () => {
    const dependencies = buildDependencies();
    const position = {
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: 2,
      column: 3,
      rowSpan: 4,
      columnSpan: 6,
    };
    dependencies.pageLayoutService.findBy.mockResolvedValue([
      {
        id: 'layout',
        name: 'Company',
        tabs: [
          {
            id: 'tab',
            title: 'Grid',
            isActive: true,
            layoutMode: PageLayoutTabLayoutMode.GRID,
            widgets: [
              {
                id: 'widget',
                title: 'Existing',
                type: 'FRONT_COMPONENT',
                position,
              },
            ],
          },
        ],
      },
    ]);
    const result = await createListRecordPageLayoutsTool({
      deps: dependencies,
      context: { workspaceId: 'workspace' },
    }).execute({ objectName: 'company' });
    expect(result).toMatchObject({
      success: true,
      result: {
        layouts: [
          {
            tabs: [
              {
                layoutMode: PageLayoutTabLayoutMode.GRID,
                widgets: [{ position }],
              },
            ],
          },
        ],
      },
    });
    expect(dependencies.pageLayoutService.findBy).toHaveBeenCalledTimes(1);
  });

  it('rejects an unknown object instead of listing all layouts', async () => {
    const dependencies = buildDependencies();
    const result = await createListRecordPageLayoutsTool({
      deps: dependencies,
      context: { workspaceId: 'workspace' },
    }).execute({ objectName: 'unknown' });
    expect(result).toEqual({
      success: false,
      error: 'Object "unknown" not found',
    });
    expect(dependencies.pageLayoutService.findBy).not.toHaveBeenCalled();
  });

  it('returns an empty list when the object has no record layout', async () => {
    const dependencies = buildDependencies();
    dependencies.pageLayoutService.findBy.mockResolvedValue([]);
    const result = await createListRecordPageLayoutsTool({
      deps: dependencies,
      context: { workspaceId: 'workspace' },
    }).execute({ objectName: 'company' });
    expect(result).toEqual({ success: true, result: { layouts: [] } });
  });
});
