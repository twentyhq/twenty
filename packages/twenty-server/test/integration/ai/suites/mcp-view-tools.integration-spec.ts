import { callMcpTool } from 'test/integration/graphql/suites/application-role-intersection/utils/call-mcp-tool.util';
import { getMcpToolCatalog } from 'test/integration/graphql/suites/application-role-intersection/utils/get-mcp-tool-catalog.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { ToolCategory } from 'twenty-shared/ai';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

const VIEW_READ_TOOL_NAMES = [
  'get_views',
  'get_view_query_parameters',
  'get_view_fields',
  'get_view_filters',
  'get_view_sorts',
];

const VIEW_WRITE_TOOL_NAMES = [
  'upsert_complete_view',
  'create_view',
  'update_view',
  'delete_view',
  'create_view_field',
  'update_view_field',
  'delete_view_field',
  'create_many_view_fields',
  'update_many_view_fields',
  'create_view_filter',
  'create_many_view_filters',
  'update_view_filter',
  'delete_view_filter',
  'create_view_sort',
  'create_many_view_sorts',
  'update_view_sort',
  'delete_view_sort',
];

const VIEW_NAME_PREFIX = 'MCP view tools';
const MISSING_VIEW_ID = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

type ViewSummary = { id: string; name: string };
type ViewFieldSummary = {
  id: string;
  fieldMetadataId: string;
  fieldName: string | null;
};

const callViewTool = ({
  toolName,
  toolArguments,
  token = API_KEY_ACCESS_TOKEN,
}: {
  toolName: string;
  toolArguments: Record<string, unknown>;
  token?: string;
}) =>
  callMcpTool({
    toolName: 'execute_tool',
    toolArguments: { toolName, arguments: toolArguments },
    token,
  });

const runViewTool = async <TResult>(
  call: Parameters<typeof callViewTool>[0],
): Promise<TResult | undefined> => {
  const result = await callViewTool(call);

  expect(result.isError).toBe(false);

  const output: ToolOutput<TResult> = JSON.parse(result.content[0].text);

  expect(output.success).toBe(true);

  return output.result;
};

const runFailingViewTool = async (
  call: Parameters<typeof callViewTool>[0],
): Promise<ToolOutput> => {
  const result = await callViewTool(call);

  expect(result.isError).toBe(true);

  return JSON.parse(result.content[0].text);
};

const listViews = async ({
  objectNameSingular,
  token,
}: {
  objectNameSingular: string;
  token?: string;
}): Promise<ViewSummary[]> => {
  const result = await runViewTool<{ views: ViewSummary[] }>({
    toolName: 'get_views',
    toolArguments: { objectNameSingular, limit: 100 },
    token,
  });

  jestExpectToBeDefined(result);

  return result.views;
};

const listViewIds = async (objectNameSingular: string) =>
  (await listViews({ objectNameSingular })).map(({ id }) => id);

const listViewFields = async (viewId: string): Promise<ViewFieldSummary[]> => {
  const result = await runViewTool<{ viewFields: ViewFieldSummary[] }>({
    toolName: 'get_view_fields',
    toolArguments: { viewId },
  });

  jestExpectToBeDefined(result);

  return result.viewFields;
};

describe('MCP view tools (integration)', () => {
  // Unlisted views are only listed to their creator, so the admin cleans up its own
  afterAll(async () => {
    for (const token of [API_KEY_ACCESS_TOKEN, APPLE_JANE_ADMIN_ACCESS_TOKEN]) {
      for (const objectNameSingular of ['company', 'opportunity']) {
        const leakedViews = (
          await listViews({ objectNameSingular, token })
        ).filter(({ name }) => name.startsWith(VIEW_NAME_PREFIX));

        for (const { id } of leakedViews) {
          await callViewTool({
            toolName: 'delete_view',
            toolArguments: { id },
            token,
          });
        }
      }
    }
  });

  it('should describe the view tools to the model', async () => {
    const result = await callMcpTool({
      toolName: 'learn_tools',
      toolArguments: {
        toolNames: [...VIEW_READ_TOOL_NAMES, ...VIEW_WRITE_TOOL_NAMES],
      },
      token: API_KEY_ACCESS_TOKEN,
    });

    expect(result.isError).toBe(false);

    const payload = JSON.parse(result.content[0].text);

    expect(payload.notFound).toEqual([]);
    expect(payload.tools).toMatchSnapshot();
  });

  it('should build, edit and delete a view', async () => {
    const viewName = `${VIEW_NAME_PREFIX} companies`;

    const createdView = await runViewTool<ViewSummary>({
      toolName: 'create_view',
      toolArguments: {
        name: viewName,
        objectNameSingular: 'company',
        fieldNames: ['name', 'domainName'],
      },
    });

    expect(createdView).toMatchObject({
      name: viewName,
      objectNameSingular: 'company',
      type: 'TABLE',
      visibility: 'WORKSPACE',
    });

    const viewId = createdView?.id;

    jestExpectToBeDefined(viewId);

    expect(await listViewIds('company')).toContain(viewId);

    const viewFields = await listViewFields(viewId);

    expect(viewFields.map(({ fieldName }) => fieldName).sort()).toEqual([
      'domainName',
      'name',
    ]);

    const nameViewField = viewFields.find(
      ({ fieldName }) => fieldName === 'name',
    );
    const domainNameViewField = viewFields.find(
      ({ fieldName }) => fieldName === 'domainName',
    );

    jestExpectToBeDefined(nameViewField);
    jestExpectToBeDefined(domainNameViewField);

    expect(
      await runViewTool({
        toolName: 'update_view_field',
        toolArguments: { id: domainNameViewField.id, size: 220 },
      }),
    ).toMatchObject({ id: domainNameViewField.id, size: 220 });

    expect(
      await runViewTool({
        toolName: 'update_many_view_fields',
        toolArguments: {
          viewFields: [{ id: domainNameViewField.id, isVisible: false }],
        },
      }),
    ).toBeUndefined();

    expect(
      await runViewTool({
        toolName: 'delete_view_field',
        toolArguments: { id: domainNameViewField.id },
      }),
    ).toEqual({ id: domainNameViewField.id, deleted: true });

    expect(
      await runViewTool({
        toolName: 'create_many_view_fields',
        toolArguments: {
          viewFields: [
            {
              viewId,
              fieldMetadataId: domainNameViewField.fieldMetadataId,
              position: 1,
            },
          ],
        },
      }),
    ).toBeUndefined();

    const readdedViewField = (await listViewFields(viewId)).find(
      ({ fieldName }) => fieldName === 'domainName',
    );

    jestExpectToBeDefined(readdedViewField);

    await runViewTool({
      toolName: 'delete_view_field',
      toolArguments: { id: readdedViewField.id },
    });

    expect(
      await runViewTool({
        toolName: 'create_view_field',
        toolArguments: {
          viewId,
          fieldMetadataId: domainNameViewField.fieldMetadataId,
          position: 1,
        },
      }),
    ).toMatchObject({
      viewId,
      fieldMetadataId: domainNameViewField.fieldMetadataId,
      position: 1,
    });

    const filter = await runViewTool<{ id: string }>({
      toolName: 'create_view_filter',
      toolArguments: {
        viewId,
        fieldMetadataId: nameViewField.fieldMetadataId,
        operand: 'CONTAINS',
        value: 'acme',
      },
    });

    jestExpectToBeDefined(filter);
    expect(filter).toMatchObject({
      viewId,
      fieldMetadataId: nameViewField.fieldMetadataId,
      operand: 'CONTAINS',
      value: 'acme',
    });

    expect(
      await runViewTool({
        toolName: 'update_view_filter',
        toolArguments: { id: filter.id, value: 'globex' },
      }),
    ).toMatchObject({ id: filter.id, value: 'globex' });

    expect(
      await runViewTool({
        toolName: 'create_many_view_filters',
        toolArguments: {
          filters: [
            {
              viewId,
              fieldMetadataId: nameViewField.fieldMetadataId,
              operand: 'DOES_NOT_CONTAIN',
              value: 'test',
            },
          ],
        },
      }),
    ).toMatchObject({
      created: [{ viewId, operand: 'DOES_NOT_CONTAIN' }],
    });

    expect(
      (
        await runViewTool<{ viewFilters: { id: string }[] }>({
          toolName: 'get_view_filters',
          toolArguments: { viewId },
        })
      )?.viewFilters.map(({ id }) => id),
    ).toContain(filter.id);

    expect(
      await runViewTool({
        toolName: 'delete_view_filter',
        toolArguments: { id: filter.id },
      }),
    ).toEqual({ id: filter.id, deleted: true });

    const sort = await runViewTool<{ id: string }>({
      toolName: 'create_view_sort',
      toolArguments: { viewId, fieldMetadataId: nameViewField.fieldMetadataId },
    });

    jestExpectToBeDefined(sort);
    expect(sort).toMatchObject({
      viewId,
      fieldMetadataId: nameViewField.fieldMetadataId,
      direction: 'ASC',
    });

    expect(
      await runViewTool({
        toolName: 'update_view_sort',
        toolArguments: { id: sort.id, direction: 'DESC' },
      }),
    ).toMatchObject({ id: sort.id, direction: 'DESC' });

    expect(
      (
        await runViewTool<{ viewSorts: { id: string }[] }>({
          toolName: 'get_view_sorts',
          toolArguments: { viewId },
        })
      )?.viewSorts.map(({ id }) => id),
    ).toEqual([sort.id]);

    expect(
      await runViewTool({
        toolName: 'delete_view_sort',
        toolArguments: { id: sort.id },
      }),
    ).toEqual({ id: sort.id, deleted: true });

    expect(
      await runViewTool({
        toolName: 'create_many_view_sorts',
        toolArguments: {
          sorts: [
            {
              viewId,
              fieldMetadataId: nameViewField.fieldMetadataId,
              direction: 'DESC',
            },
          ],
        },
      }),
    ).toMatchObject({ created: [{ viewId, direction: 'DESC' }] });

    expect(
      await runViewTool({
        toolName: 'get_view_query_parameters',
        toolArguments: { viewId },
      }),
    ).toMatchObject({ orderBy: [{ name: 'DescNullsLast' }] });

    const renamedViewName = `${VIEW_NAME_PREFIX} renamed companies`;

    expect(
      await runViewTool({
        toolName: 'upsert_complete_view',
        toolArguments: { id: viewId, name: renamedViewName, sorts: [] },
      }),
    ).toMatchObject({
      id: viewId,
      name: renamedViewName,
      fieldCount: 2,
      filterCount: 1,
      sortCount: 0,
    });

    expect(
      await runViewTool({
        toolName: 'update_view',
        toolArguments: { id: viewId, icon: 'IconStar' },
      }),
    ).toMatchObject({ id: viewId, name: renamedViewName, icon: 'IconStar' });

    expect(
      await runViewTool({
        toolName: 'delete_view',
        toolArguments: { id: viewId },
      }),
    ).toEqual({ id: viewId, name: renamedViewName, deleted: true });
    expect(await listViewIds('company')).not.toContain(viewId);
  });

  it('should create a kanban view grouped by a select field', async () => {
    const viewName = `${VIEW_NAME_PREFIX} pipeline`;

    const kanbanView = await runViewTool<ViewSummary>({
      toolName: 'create_view',
      toolArguments: {
        name: viewName,
        objectNameSingular: 'opportunity',
        type: 'KANBAN',
        mainGroupByFieldName: 'stage',
      },
    });

    jestExpectToBeDefined(kanbanView);
    expect(kanbanView).toMatchObject({ name: viewName, type: 'KANBAN' });

    await runViewTool({
      toolName: 'delete_view',
      toolArguments: { id: kanbanView.id },
    });
  });

  it.each([
    {
      title: 'a kanban grouped by a relation field',
      toolName: 'create_view',
      toolArguments: {
        name: `${VIEW_NAME_PREFIX} pipeline by company`,
        objectNameSingular: 'opportunity',
        type: 'KANBAN',
        mainGroupByFieldName: 'company',
      },
      error:
        'Field "company" has type "RELATION" and cannot be used as a group-by field. Only SELECT fields are supported for grouping (board columns and table groups).',
    },
    {
      title: 'a table grouped by a text field',
      toolName: 'create_view',
      toolArguments: {
        name: `${VIEW_NAME_PREFIX} companies by name`,
        objectNameSingular: 'company',
        type: 'TABLE',
        mainGroupByFieldName: 'name',
      },
      error:
        'Field "name" has type "TEXT" and cannot be used as a group-by field. Only SELECT fields are supported for grouping (board columns and table groups).',
    },
    {
      title: 'a table upserted with a text group-by field',
      toolName: 'upsert_complete_view',
      toolArguments: {
        name: `${VIEW_NAME_PREFIX} upserted companies by name`,
        objectNameSingular: 'company',
        type: 'TABLE',
        mainGroupByFieldName: 'name',
      },
      error:
        'Field "name" has type "TEXT" and cannot be used as a group-by field. Only SELECT fields are supported for grouping (board columns and table groups).',
    },
    {
      title: 'a calendar on a field that is not a date',
      toolName: 'create_view',
      toolArguments: {
        name: `${VIEW_NAME_PREFIX} calendar`,
        objectNameSingular: 'company',
        type: 'CALENDAR',
        calendarLayout: 'MONTH',
        calendarFieldName: 'name',
      },
      error:
        'Field "name" has type "TEXT" and cannot be used as a calendar field. Only DATE or DATE_TIME fields are supported.',
    },
    {
      title: 'a table with a calendar field that is not a date',
      toolName: 'create_view',
      toolArguments: {
        name: `${VIEW_NAME_PREFIX} companies with a calendar field`,
        objectNameSingular: 'company',
        type: 'TABLE',
        calendarFieldName: 'name',
      },
      error:
        'Field "name" has type "TEXT" and cannot be used as a calendar field. Only DATE or DATE_TIME fields are supported.',
    },
  ])('should refuse $title', async ({ toolName, toolArguments, error }) => {
    expect(await runFailingViewTool({ toolName, toolArguments })).toEqual({
      success: false,
      message: `Failed to execute ${toolName}`,
      error,
    });
  });

  it('should create no view when a field name is unknown', async () => {
    const viewName = `${VIEW_NAME_PREFIX} companies with an unknown field`;

    expect(
      await runFailingViewTool({
        toolName: 'create_view',
        toolArguments: {
          name: viewName,
          objectNameSingular: 'company',
          fieldNames: ['name', 'unknownField'],
        },
      }),
    ).toEqual({
      success: false,
      message: 'Failed to execute create_view',
      error:
        'Field "unknownField" not found on this object. Use get_field_metadata to list available fields.',
    });
    expect(
      (await listViews({ objectNameSingular: 'company' })).map(
        ({ name }) => name,
      ),
    ).not.toContain(viewName);
  });

  it.each([
    { toolName: 'update_view', toolArguments: { name: 'Renamed' } },
    { toolName: 'upsert_complete_view', toolArguments: { name: 'Renamed' } },
    { toolName: 'delete_view', toolArguments: {} },
  ])(
    'should refuse $toolName on a view that does not exist',
    async ({ toolName, toolArguments }) => {
      expect(
        await runFailingViewTool({
          toolName,
          toolArguments: { id: MISSING_VIEW_ID, ...toolArguments },
        }),
      ).toEqual({
        success: false,
        message: `Failed to execute ${toolName}`,
        error: `View with id ${MISSING_VIEW_ID} not found`,
      });
    },
  );

  it('should only let the creator of an unlisted view update, upsert or delete it', async () => {
    const unlistedView = await runViewTool<ViewSummary>({
      toolName: 'create_view',
      toolArguments: {
        name: `${VIEW_NAME_PREFIX} private companies`,
        objectNameSingular: 'company',
        visibility: 'UNLISTED',
      },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    jestExpectToBeDefined(unlistedView);
    expect(
      (
        await listViews({
          objectNameSingular: 'company',
          token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        })
      ).map(({ id }) => id),
    ).not.toContain(unlistedView.id);

    for (const token of [
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
      API_KEY_ACCESS_TOKEN,
    ]) {
      for (const { toolName, toolArguments, operation } of [
        {
          toolName: 'update_view',
          toolArguments: {
            id: unlistedView.id,
            name: `${VIEW_NAME_PREFIX} renamed private companies`,
          },
          operation: 'update',
        },
        {
          toolName: 'upsert_complete_view',
          toolArguments: {
            id: unlistedView.id,
            name: `${VIEW_NAME_PREFIX} renamed private companies`,
          },
          operation: 'update',
        },
        {
          toolName: 'delete_view',
          toolArguments: { id: unlistedView.id },
          operation: 'delete',
        },
      ]) {
        expect(
          await runFailingViewTool({ toolName, toolArguments, token }),
        ).toEqual({
          success: false,
          message: `Failed to execute ${toolName}`,
          error: `You can only ${operation} your own unlisted views`,
        });
      }
    }

    expect(
      await runViewTool({
        toolName: 'delete_view',
        toolArguments: { id: unlistedView.id },
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      }),
    ).toMatchObject({ id: unlistedView.id, deleted: true });
  });

  // The seeded guest role cannot access tools, so it lacks VIEWS
  describe('for a guest without VIEWS', () => {
    it('should list only the read tools of the view category', async () => {
      const catalog = await getMcpToolCatalog({
        token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
      });

      expect(catalog[ToolCategory.VIEW].map(({ name }) => name).sort()).toEqual(
        [...VIEW_READ_TOOL_NAMES].sort(),
      );
    });

    it('should run a read tool', async () => {
      expect(
        await listViews({
          objectNameSingular: 'company',
          token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
        }),
      ).not.toHaveLength(0);
    });

    it.each(VIEW_WRITE_TOOL_NAMES)('should refuse %s', async (toolName) => {
      expect(
        await runFailingViewTool({
          toolName,
          toolArguments: {},
          token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
        }),
      ).toMatchObject({
        success: false,
        message: `Tool "${toolName}" not found`,
      });
    });
  });
});
