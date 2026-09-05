import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { MigrateCanvasTabsToVerticalListSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-instance-command-slow-1788603039076-migrate-canvas-tabs-to-vertical-list';

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
  let command: MigrateCanvasTabsToVerticalListSlowInstanceCommand;
  let workspaceId: string;
  let applicationId: string;
  let pageLayoutId: string;

  const seedTab = async ({
    layoutMode,
    widgetIsActiveValues,
    widgetOverrides = null,
    widgetPosition = { layoutMode },
  }: {
    layoutMode: 'CANVAS' | 'VERTICAL_LIST';
    widgetIsActiveValues: boolean[];
    widgetOverrides?: Record<string, unknown> | null;
    widgetPosition?: Record<string, unknown>;
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

  const runDown = async (): Promise<void> => {
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      await command.down(queryRunner);
    } finally {
      await queryRunner.release();
    }
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

    command = new MigrateCanvasTabsToVerticalListSlowInstanceCommand();

    const [source] = (await dataSource.query(
      `SELECT "workspaceId", "applicationId"
       FROM "core"."pageLayout"
       LIMIT 1`,
    )) as { workspaceId: string; applicationId: string }[];

    if (!isDefined(source)) {
      throw new Error(
        'No seeded page layout found; run database:reset before the integration suite.',
      );
    }

    workspaceId = source.workspaceId;
    applicationId = source.applicationId;
  }, 30000);

  beforeEach(async () => {
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
    const [{ backupTable }] = (await dataSource.query(
      `SELECT to_regclass('core."canvasTabToVerticalListMigrationBackup"') AS "backupTable"`,
    )) as { backupTable: string | null }[];

    if (isDefined(backupTable)) {
      await runDown();
    }

    await dataSource.query(`DELETE FROM "core"."pageLayout" WHERE "id" = $1`, [
      pageLayoutId,
    ]);
  });

  afterAll(async () => {
    await dataSource?.destroy();
  });

  it('migrates only eligible Canvas tabs and rolls back only the rows it changed', async () => {
    const originalCanvasPosition = {
      layoutMode: 'CANVAS',
      preservedValue: 'original',
    };
    const originalCanvasOverrides = {
      title: 'Preserved override title',
      position: {
        layoutMode: 'CANVAS',
        preservedValue: 'original override',
      },
    };
    const eligibleCanvasTab = await seedTab({
      layoutMode: 'CANVAS',
      widgetIsActiveValues: [true],
      widgetOverrides: originalCanvasOverrides,
      widgetPosition: originalCanvasPosition,
    });
    const eligibleCanvasTabWithoutOverride = await seedTab({
      layoutMode: 'CANVAS',
      widgetIsActiveValues: [true],
      widgetPosition: {
        layoutMode: 'CANVAS',
        preservedValue: 'without override',
      },
    });
    const multiWidgetCanvasTab = await seedTab({
      layoutMode: 'CANVAS',
      widgetIsActiveValues: [true, true],
    });
    const emptyCanvasTab = await seedTab({
      layoutMode: 'CANVAS',
      widgetIsActiveValues: [],
    });
    const inactiveWidgetCanvasTab = await seedTab({
      layoutMode: 'CANVAS',
      widgetIsActiveValues: [false],
    });
    const nativeViewportTab = await seedTab({
      layoutMode: 'VERTICAL_LIST',
      widgetIsActiveValues: [true],
      widgetPosition: {
        layoutMode: 'VERTICAL_LIST',
        index: 0,
        heightBehavior: 'TAB_VIEWPORT',
      },
    });
    const movedCanvasWidgetPosition = {
      layoutMode: 'CANVAS',
      preservedValue: 'moved widget base position',
    };
    const movedCanvasWidgetOverrides = {
      pageLayoutTabId: nativeViewportTab.tabId,
      position: {
        layoutMode: 'VERTICAL_LIST',
        index: 1,
        heightBehavior: 'FIT_CONTENT',
      },
    };
    const movedCanvasWidgetTab = await seedTab({
      layoutMode: 'CANVAS',
      widgetIsActiveValues: [true],
      widgetOverrides: movedCanvasWidgetOverrides,
      widgetPosition: movedCanvasWidgetPosition,
    });
    const detachedCanvasWidgetPosition = {
      layoutMode: 'CANVAS',
      preservedValue: 'detached widget base position',
    };
    const detachedCanvasWidgetOverrides = {
      pageLayoutTabId: null,
      position: {
        layoutMode: 'CANVAS',
        preservedValue: 'detached widget override position',
      },
    };
    const detachedCanvasWidgetTab = await seedTab({
      layoutMode: 'CANVAS',
      widgetIsActiveValues: [true],
      widgetOverrides: detachedCanvasWidgetOverrides,
      widgetPosition: detachedCanvasWidgetPosition,
    });

    await dataSource.query(`
      CREATE TABLE "core"."canvasTabToVerticalListMigrationBackup" (
        "pageLayoutTabId" uuid PRIMARY KEY,
        "pageLayoutWidgetId" uuid NOT NULL UNIQUE,
        "pageLayoutWidgetPosition" jsonb
      )
    `);

    await command.runDataMigration(dataSource);

    await expect(
      readTabAndWidgetState({
        tabId: eligibleCanvasTab.tabId,
        widgetId: eligibleCanvasTab.widgetIds[0],
      }),
    ).resolves.toEqual({
      layoutMode: 'VERTICAL_LIST',
      overrides: {
        title: 'Preserved override title',
        position: {
          layoutMode: 'VERTICAL_LIST',
          index: 0,
          heightBehavior: 'TAB_VIEWPORT',
        },
      },
      position: {
        layoutMode: 'VERTICAL_LIST',
        index: 0,
        heightBehavior: 'TAB_VIEWPORT',
      },
    });
    await expect(
      readTabAndWidgetState({
        tabId: eligibleCanvasTabWithoutOverride.tabId,
        widgetId: eligibleCanvasTabWithoutOverride.widgetIds[0],
      }),
    ).resolves.toEqual({
      layoutMode: 'VERTICAL_LIST',
      overrides: null,
      position: {
        layoutMode: 'VERTICAL_LIST',
        index: 0,
        heightBehavior: 'TAB_VIEWPORT',
      },
    });
    await expect(
      readTabAndWidgetState({
        tabId: multiWidgetCanvasTab.tabId,
        widgetId: multiWidgetCanvasTab.widgetIds[0],
      }),
    ).resolves.toEqual({
      layoutMode: 'CANVAS',
      overrides: null,
      position: { layoutMode: 'CANVAS' },
    });
    await expect(
      readTabAndWidgetState({
        tabId: movedCanvasWidgetTab.tabId,
        widgetId: movedCanvasWidgetTab.widgetIds[0],
      }),
    ).resolves.toEqual({
      layoutMode: 'VERTICAL_LIST',
      overrides: movedCanvasWidgetOverrides,
      position: {
        layoutMode: 'VERTICAL_LIST',
        index: 0,
        heightBehavior: 'TAB_VIEWPORT',
      },
    });
    await expect(
      readTabAndWidgetState({
        tabId: detachedCanvasWidgetTab.tabId,
        widgetId: detachedCanvasWidgetTab.widgetIds[0],
      }),
    ).resolves.toEqual({
      layoutMode: 'VERTICAL_LIST',
      overrides: detachedCanvasWidgetOverrides,
      position: {
        layoutMode: 'VERTICAL_LIST',
        index: 0,
        heightBehavior: 'TAB_VIEWPORT',
      },
    });
    await expect(readTabLayoutMode(emptyCanvasTab.tabId)).resolves.toBe(
      'CANVAS',
    );
    await expect(
      readTabAndWidgetState({
        tabId: inactiveWidgetCanvasTab.tabId,
        widgetId: inactiveWidgetCanvasTab.widgetIds[0],
      }),
    ).resolves.toEqual({
      layoutMode: 'CANVAS',
      overrides: null,
      position: { layoutMode: 'CANVAS' },
    });

    const postMigrationNativeViewportTab = await seedTab({
      layoutMode: 'VERTICAL_LIST',
      widgetIsActiveValues: [true],
      widgetPosition: {
        layoutMode: 'VERTICAL_LIST',
        index: 0,
        heightBehavior: 'TAB_VIEWPORT',
      },
    });

    await runDown();

    await expect(
      readTabAndWidgetState({
        tabId: eligibleCanvasTab.tabId,
        widgetId: eligibleCanvasTab.widgetIds[0],
      }),
    ).resolves.toEqual({
      layoutMode: 'CANVAS',
      overrides: originalCanvasOverrides,
      position: originalCanvasPosition,
    });
    await expect(
      readTabAndWidgetState({
        tabId: eligibleCanvasTabWithoutOverride.tabId,
        widgetId: eligibleCanvasTabWithoutOverride.widgetIds[0],
      }),
    ).resolves.toEqual({
      layoutMode: 'CANVAS',
      overrides: null,
      position: {
        layoutMode: 'CANVAS',
        preservedValue: 'without override',
      },
    });
    await expect(
      readTabAndWidgetState({
        tabId: movedCanvasWidgetTab.tabId,
        widgetId: movedCanvasWidgetTab.widgetIds[0],
      }),
    ).resolves.toEqual({
      layoutMode: 'CANVAS',
      overrides: movedCanvasWidgetOverrides,
      position: movedCanvasWidgetPosition,
    });
    await expect(
      readTabAndWidgetState({
        tabId: detachedCanvasWidgetTab.tabId,
        widgetId: detachedCanvasWidgetTab.widgetIds[0],
      }),
    ).resolves.toEqual({
      layoutMode: 'CANVAS',
      overrides: detachedCanvasWidgetOverrides,
      position: detachedCanvasWidgetPosition,
    });

    for (const nativeTab of [
      nativeViewportTab,
      postMigrationNativeViewportTab,
    ]) {
      await expect(
        readTabAndWidgetState({
          tabId: nativeTab.tabId,
          widgetId: nativeTab.widgetIds[0],
        }),
      ).resolves.toEqual({
        layoutMode: 'VERTICAL_LIST',
        overrides: null,
        position: {
          layoutMode: 'VERTICAL_LIST',
          index: 0,
          heightBehavior: 'TAB_VIEWPORT',
        },
      });
    }
  }, 60000);
});
