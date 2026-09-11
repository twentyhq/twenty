import { isDefined } from 'twenty-shared/utils';
import { DataSource, type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { MigrateCanvasTabsToVerticalListSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-instance-command-slow-1788770678957-migrate-canvas-tabs-to-vertical-list';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

jest.useRealTimers();

type SeededTab = {
  tabId: string;
  widgetIds: string[];
};

type TabAndWidgetState = {
  layoutMode: string;
  overrides: Record<string, unknown> | null;
  position: Record<string, unknown> | null;
};

describe('MigrateCanvasTabsToVerticalListSlowInstanceCommand (integration)', () => {
  let dataSource: DataSource;
  let queryRunner: QueryRunner;
  let command: MigrateCanvasTabsToVerticalListSlowInstanceCommand;
  let workspaceId: string;
  let applicationId: string;
  let pageLayoutId: string;

  const workspaceCacheService = { flush: jest.fn() };

  const seedTab = async ({
    layoutMode,
    widgetIsActiveValues,
    widgetOverrides = null,
    widgetPosition = { layoutMode },
  }: {
    layoutMode: 'CANVAS' | 'VERTICAL_LIST';
    widgetIsActiveValues: boolean[];
    widgetOverrides?: Record<string, unknown> | null;
    widgetPosition?: Record<string, unknown> | null;
  }): Promise<SeededTab> => {
    const tabId = v4();

    await dataSource.query(
      `INSERT INTO "core"."pageLayoutTab" (
        "id",
        "workspaceId",
        "applicationId",
        "universalIdentifier",
        "pageLayoutId",
        "title",
        "position",
        "layoutMode",
        "isActive"
      ) VALUES ($1, $2, $3, $4, $5, 'Migration test tab', 0, $6, true)`,
      [tabId, workspaceId, applicationId, v4(), pageLayoutId, layoutMode],
    );

    const widgetIds: string[] = [];

    for (const [index, isActive] of widgetIsActiveValues.entries()) {
      const widgetId = v4();

      await dataSource.query(
        `INSERT INTO "core"."pageLayoutWidget" (
          "id",
          "workspaceId",
          "applicationId",
          "universalIdentifier",
          "pageLayoutTabId",
          "title",
          "type",
          "gridPosition",
          "position",
          "overrides",
          "configuration",
          "isActive"
        ) VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          'Migration test widget',
          'VIEW',
          $6,
          $7,
          $8,
          $9,
          $10
        )`,
        [
          widgetId,
          workspaceId,
          applicationId,
          v4(),
          tabId,
          JSON.stringify({ row: index, column: 0, rowSpan: 1, columnSpan: 12 }),
          JSON.stringify(widgetPosition),
          JSON.stringify(widgetOverrides),
          JSON.stringify({ configurationType: 'VIEW' }),
          isActive,
        ],
      );

      widgetIds.push(widgetId);
    }

    return { tabId, widgetIds };
  };

  const readTabAndWidgetState = async ({
    tabId,
    widgetId,
  }: {
    tabId: string;
    widgetId: string;
  }): Promise<TabAndWidgetState> => {
    const [state] = (await dataSource.query(
      `SELECT tab."layoutMode", widget."position", widget."overrides"
       FROM "core"."pageLayoutTab" tab
       JOIN "core"."pageLayoutWidget" widget
         ON widget."pageLayoutTabId" = tab."id"
       WHERE tab."id" = $1 AND widget."id" = $2`,
      [tabId, widgetId],
    )) as TabAndWidgetState[];

    if (!isDefined(state)) {
      throw new Error('Seeded page layout tab or widget was not found');
    }

    return state;
  };

  const readTabLayoutMode = async (tabId: string): Promise<string> => {
    const [state] = (await dataSource.query(
      `SELECT "layoutMode"
       FROM "core"."pageLayoutTab"
       WHERE "id" = $1`,
      [tabId],
    )) as { layoutMode: string }[];

    if (!isDefined(state)) {
      throw new Error('Seeded page layout tab was not found');
    }

    return state.layoutMode;
  };

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      url: process.env.PG_DATABASE_URL,
      schema: 'core',
      entities: [],
      synchronize: false,
    });
    await dataSource.initialize();

    command = new MigrateCanvasTabsToVerticalListSlowInstanceCommand(
      workspaceCacheService as unknown as WorkspaceCacheService,
    );

    const [source] = (await dataSource.query(
      `SELECT "id" AS "workspaceId", "workspaceCustomApplicationId" AS "applicationId"
       FROM "core"."workspace"
       WHERE "workspaceCustomApplicationId" IS NOT NULL
       ORDER BY "id"
       LIMIT 1`,
    )) as { workspaceId: string; applicationId: string }[];

    if (!isDefined(source)) {
      throw new Error(
        'No seeded workspace found; run database:reset before the integration suite.',
      );
    }

    workspaceId = source.workspaceId;
    applicationId = source.applicationId;
  }, 30000);

  beforeEach(async () => {
    workspaceCacheService.flush.mockReset().mockResolvedValue(undefined);

    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Roll back changes to seeded layouts along with the test fixtures.
    jest
      .spyOn(dataSource, 'query')
      .mockImplementation((query, parameters) =>
        queryRunner.query(query, parameters),
      );

    pageLayoutId = v4();

    await dataSource.query(
      `INSERT INTO "core"."pageLayout" (
        "id",
        "workspaceId",
        "applicationId",
        "universalIdentifier",
        "name",
        "type"
      ) VALUES ($1, $2, $3, $4, 'Canvas migration integration test', 'RECORD_PAGE')`,
      [pageLayoutId, workspaceId, applicationId, v4()],
    );
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  afterAll(async () => {
    await dataSource?.destroy();
  });

  it.each([
    { widgetPosition: { layoutMode: 'GRID', row: 2, column: 1 } },
    { widgetPosition: { layoutMode: 'VERTICAL_LIST', index: 4 } },
    {
      widgetOverrides: { position: { layoutMode: 'GRID', row: 2, column: 1 } },
    },
    {
      widgetOverrides: { position: { layoutMode: 'VERTICAL_LIST', index: 4 } },
    },
  ])('preserves authored non-Canvas positions %j', async (widgetOptions) => {
    const tab = await seedTab({
      layoutMode: 'CANVAS',
      widgetIsActiveValues: [true],
      ...widgetOptions,
    });
    const originalState = await readTabAndWidgetState({
      tabId: tab.tabId,
      widgetId: tab.widgetIds[0],
    });

    await command.runDataMigration(dataSource);

    expect(
      await readTabAndWidgetState({
        tabId: tab.tabId,
        widgetId: tab.widgetIds[0],
      }),
    ).toEqual(originalState);
  });

  it.each([false, true])(
    'preserves outgoing tab overrides with a position override: %s',
    async (hasPositionOverride) => {
      const destinationTab = await seedTab({
        layoutMode: 'CANVAS',
        widgetIsActiveValues: [true],
      });
      const sourceTab = await seedTab({
        layoutMode: 'CANVAS',
        widgetIsActiveValues: [true],
        widgetOverrides: {
          pageLayoutTabId: destinationTab.tabId,
          ...(hasPositionOverride
            ? { position: { layoutMode: 'CANVAS' } }
            : {}),
        },
      });
      const originalStates = await Promise.all(
        [sourceTab, destinationTab].map((tab) =>
          readTabAndWidgetState({
            tabId: tab.tabId,
            widgetId: tab.widgetIds[0],
          }),
        ),
      );

      await command.runDataMigration(dataSource);

      for (const [index, tab] of [sourceTab, destinationTab].entries()) {
        expect(
          await readTabAndWidgetState({
            tabId: tab.tabId,
            widgetId: tab.widgetIds[0],
          }),
        ).toEqual(originalStates[index]);
      }
    },
  );

  it('retries cache invalidation after the rows have already been migrated', async () => {
    const canvasTab = await seedTab({
      layoutMode: 'CANVAS',
      widgetIsActiveValues: [true],
    });
    const cacheError = new Error('Cache unavailable');

    workspaceCacheService.flush.mockRejectedValueOnce(cacheError);

    await expect(command.runDataMigration(dataSource)).rejects.toThrow(
      cacheError,
    );
    expect(await readTabLayoutMode(canvasTab.tabId)).toBe('VERTICAL_LIST');

    workspaceCacheService.flush.mockClear();

    await command.runDataMigration(dataSource);

    expect(workspaceCacheService.flush).toHaveBeenCalledWith(workspaceId, [
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
    ]);
    expect(
      await readTabAndWidgetState({
        tabId: canvasTab.tabId,
        widgetId: canvasTab.widgetIds[0],
      }),
    ).toMatchObject({
      layoutMode: 'VERTICAL_LIST',
      position: {
        layoutMode: 'VERTICAL_LIST',
        index: 0,
        heightBehavior: 'TAB_VIEWPORT',
      },
    });
  });

  it.each([
    null,
    { position: null },
    { position: { layoutMode: 'CANVAS' }, title: 'Custom title' },
  ])(
    'migrates a workspace Canvas tab and preserves unrelated overrides %j',
    async (widgetOverrides) => {
      const tab = await seedTab({
        layoutMode: 'CANVAS',
        widgetIsActiveValues: [true],
        widgetPosition: null,
        widgetOverrides,
      });
      const position = {
        layoutMode: 'VERTICAL_LIST',
        index: 0,
        heightBehavior: 'TAB_VIEWPORT',
      };

      await command.runDataMigration(dataSource);
      await command.runDataMigration(dataSource);

      expect(
        await readTabAndWidgetState({
          tabId: tab.tabId,
          widgetId: tab.widgetIds[0],
        }),
      ).toEqual({
        layoutMode: 'VERTICAL_LIST',
        position,
        overrides: isDefined(widgetOverrides)
          ? { ...widgetOverrides, position }
          : null,
      });
    },
  );

  it.each(
    [[], [false], [true, true], [true, false]].map((widgetIsActiveValues) => ({
      widgetIsActiveValues,
    })),
  )(
    'preserves Canvas tabs without exactly one active, undeleted widget: %j',
    async ({ widgetIsActiveValues }) => {
      const tab = await seedTab({ layoutMode: 'CANVAS', widgetIsActiveValues });

      await command.runDataMigration(dataSource);

      expect(await readTabLayoutMode(tab.tabId)).toBe('CANVAS');
    },
  );

  it.each(['pageLayoutTab', 'pageLayoutWidget'] as const)(
    'preserves manifest-owned %s and its Canvas position override',
    async (entity) => {
      const tab = await seedTab({
        layoutMode: 'CANVAS',
        widgetIsActiveValues: [true],
        widgetOverrides: { position: { layoutMode: 'CANVAS' } },
      });

      await dataSource.query(
        `UPDATE "core"."${entity}" SET "applicationId" = (
          SELECT "applicationId" FROM "core"."pageLayout"
          WHERE "workspaceId" = $1 AND "applicationId" <> $2 LIMIT 1
        ) WHERE "id" = $3`,
        [
          workspaceId,
          applicationId,
          entity === 'pageLayoutTab' ? tab.tabId : tab.widgetIds[0],
        ],
      );
      const originalState = await readTabAndWidgetState({
        tabId: tab.tabId,
        widgetId: tab.widgetIds[0],
      });

      await command.runDataMigration(dataSource);

      expect(
        await readTabAndWidgetState({
          tabId: tab.tabId,
          widgetId: tab.widgetIds[0],
        }),
      ).toEqual(originalState);
    },
  );

  it('preserves edits to an already migrated vertical-list position on retry', async () => {
    const tab = await seedTab({
      layoutMode: 'CANVAS',
      widgetIsActiveValues: [true],
    });

    await command.runDataMigration(dataSource);

    const editedPosition = {
      layoutMode: 'VERTICAL_LIST',
      index: 0,
      heightBehavior: 'FIT_CONTENT',
    };

    await dataSource.query(
      `UPDATE "core"."pageLayoutWidget" SET "position" = $1 WHERE "id" = $2`,
      [editedPosition, tab.widgetIds[0]],
    );
    await command.runDataMigration(dataSource);

    expect(
      await readTabAndWidgetState({
        tabId: tab.tabId,
        widgetId: tab.widgetIds[0],
      }),
    ).toMatchObject({ position: editedPosition });
  });
  it('ignores deleted widgets when counting active Canvas contents', async () => {
    const tab = await seedTab({
      layoutMode: 'CANVAS',
      widgetIsActiveValues: [true, true],
    });

    await dataSource.query(
      `UPDATE "core"."pageLayoutWidget" SET "deletedAt" = NOW() WHERE "id" = $1`,
      [tab.widgetIds[1]],
    );
    await command.runDataMigration(dataSource);

    expect(await readTabLayoutMode(tab.tabId)).toBe('VERTICAL_LIST');
    expect(
      await readTabAndWidgetState({
        tabId: tab.tabId,
        widgetId: tab.widgetIds[1],
      }),
    ).toMatchObject({ position: { layoutMode: 'CANVAS' } });
  });

  it('preserves deleted Canvas tabs', async () => {
    const tab = await seedTab({
      layoutMode: 'CANVAS',
      widgetIsActiveValues: [true],
    });

    await dataSource.query(
      `UPDATE "core"."pageLayoutTab" SET "deletedAt" = NOW() WHERE "id" = $1`,
      [tab.tabId],
    );
    await command.runDataMigration(dataSource);

    expect(await readTabLayoutMode(tab.tabId)).toBe('CANVAS');
  });

  it('preserves tabs receiving an inactive widget through an override', async () => {
    const destinationTab = await seedTab({
      layoutMode: 'CANVAS',
      widgetIsActiveValues: [true],
    });

    await seedTab({
      layoutMode: 'CANVAS',
      widgetIsActiveValues: [false],
      widgetOverrides: { pageLayoutTabId: destinationTab.tabId },
    });
    await command.runDataMigration(dataSource);

    expect(await readTabLayoutMode(destinationTab.tabId)).toBe('CANVAS');
  });
});
