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

  const runDown = async (): Promise<void> => {
    await command.down(queryRunner);
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
    workspaceCacheService.flush.mockReset().mockResolvedValue(undefined);

    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // The instance command also touches seeded layouts and an existing backup table.
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

    await runDown();

    expect(
      await readTabAndWidgetState({
        tabId: tab.tabId,
        widgetId: tab.widgetIds[0],
      }),
    ).toEqual(originalState);
  });

  it.each([null, { position: null }])(
    'migrates and restores missing positions with overrides %j',
    async (widgetOverrides) => {
      const tab = await seedTab({
        layoutMode: 'CANVAS',
        widgetIsActiveValues: [true],
        widgetPosition: null,
        widgetOverrides,
      });
      const originalState = await readTabAndWidgetState({
        tabId: tab.tabId,
        widgetId: tab.widgetIds[0],
      });

      await command.runDataMigration(dataSource);

      expect(await readTabLayoutMode(tab.tabId)).toBe('VERTICAL_LIST');

      await runDown();

      expect(
        await readTabAndWidgetState({
          tabId: tab.tabId,
          widgetId: tab.widgetIds[0],
        }),
      ).toEqual(originalState);
    },
  );

  it.each([null, { position: { layoutMode: 'CANVAS' } }])(
    'preserves overrides edited before retrying a backed-up Canvas tab from %j',
    async (widgetOverrides) => {
      const tab = await seedTab({
        layoutMode: 'CANVAS',
        widgetIsActiveValues: [true],
        widgetOverrides,
      });

      await command.runDataMigration(dataSource);
      await dataSource.query(
        `UPDATE "core"."pageLayoutTab" SET "layoutMode" = 'CANVAS' WHERE "id" = $1`,
        [tab.tabId],
      );
      await dataSource.query(
        `UPDATE "core"."pageLayoutWidget"
         SET "position" = '{"layoutMode":"CANVAS"}'::jsonb, "overrides" = $1
         WHERE "id" = $2`,
        [
          isDefined(widgetOverrides)
            ? { title: 'Edited title' }
            : {
                position: {
                  layoutMode: 'CANVAS',
                  preservedValue: 'New position',
                },
              },
          tab.widgetIds[0],
        ],
      );
      const editedState = await readTabAndWidgetState({
        tabId: tab.tabId,
        widgetId: tab.widgetIds[0],
      });

      await command.runDataMigration(dataSource);

      expect(
        await readTabAndWidgetState({
          tabId: tab.tabId,
          widgetId: tab.widgetIds[0],
        }),
      ).toEqual(editedState);

      await runDown();

      expect(
        await readTabAndWidgetState({
          tabId: tab.tabId,
          widgetId: tab.widgetIds[0],
        }),
      ).toEqual(editedState);
    },
  );

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

      await runDown();

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

  it('preserves a backed-up widget moved to another Canvas tab before a retry', async () => {
    const originalTab = await seedTab({
      layoutMode: 'CANVAS',
      widgetIsActiveValues: [true],
    });
    const destinationTab = await seedTab({
      layoutMode: 'CANVAS',
      widgetIsActiveValues: [],
    });

    await command.runDataMigration(dataSource);

    await dataSource.query(
      `UPDATE "core"."pageLayoutWidget"
       SET "pageLayoutTabId" = $1, "position" = '{"layoutMode":"CANVAS"}'::jsonb
       WHERE "id" = $2`,
      [destinationTab.tabId, originalTab.widgetIds[0]],
    );

    await command.runDataMigration(dataSource);

    const movedWidgetState = await readTabAndWidgetState({
      tabId: destinationTab.tabId,
      widgetId: originalTab.widgetIds[0],
    });

    expect(movedWidgetState).toMatchObject({
      layoutMode: 'CANVAS',
      position: { layoutMode: 'CANVAS' },
    });

    await runDown();

    expect(
      await readTabAndWidgetState({
        tabId: destinationTab.tabId,
        widgetId: originalTab.widgetIds[0],
      }),
    ).toEqual(movedWidgetState);
  });

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

    workspaceCacheService.flush.mockClear();

    await runDown();

    expect(await readTabLayoutMode(canvasTab.tabId)).toBe('CANVAS');
    expect(workspaceCacheService.flush).toHaveBeenCalledWith(workspaceId, [
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
    ]);
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

    await command.up(queryRunner);
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

    await command.runDataMigration(dataSource);
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

  it('leaves Canvas tabs receiving widgets through overrides unchanged', async () => {
    const firstTab = await seedTab({
      layoutMode: 'CANVAS',
      widgetIsActiveValues: [true],
    });
    const secondTab = await seedTab({
      layoutMode: 'CANVAS',
      widgetIsActiveValues: [true],
    });

    for (const [sourceTab, destinationTab] of [
      [firstTab, secondTab],
      [secondTab, firstTab],
    ]) {
      await dataSource.query(
        `UPDATE "core"."pageLayoutWidget" SET "overrides" = $1 WHERE "id" = $2`,
        [
          {
            pageLayoutTabId: destinationTab.tabId,
            position: { layoutMode: 'CANVAS' },
          },
          sourceTab.widgetIds[0],
        ],
      );
    }

    await command.runDataMigration(dataSource);

    for (const [sourceTab, destinationTab] of [
      [firstTab, secondTab],
      [secondTab, firstTab],
    ]) {
      await expect(
        readTabAndWidgetState({
          tabId: sourceTab.tabId,
          widgetId: sourceTab.widgetIds[0],
        }),
      ).resolves.toEqual({
        layoutMode: 'CANVAS',
        position: { layoutMode: 'CANVAS' },
        overrides: {
          pageLayoutTabId: destinationTab.tabId,
          position: { layoutMode: 'CANVAS' },
        },
      });
    }
  });

  it('does not roll back a widget moved to a native vertical-list tab', async () => {
    const originalTab = await seedTab({
      layoutMode: 'CANVAS',
      widgetIsActiveValues: [true],
    });
    const destinationTab = await seedTab({
      layoutMode: 'VERTICAL_LIST',
      widgetIsActiveValues: [],
    });

    await command.runDataMigration(dataSource);

    const replacementTab = await seedTab({
      layoutMode: 'VERTICAL_LIST',
      widgetIsActiveValues: [true],
      widgetPosition: { layoutMode: 'VERTICAL_LIST', index: 0 },
    });

    await dataSource.query(
      `UPDATE "core"."pageLayoutWidget" SET "pageLayoutTabId" = $1 WHERE "id" = $2`,
      [destinationTab.tabId, originalTab.widgetIds[0]],
    );
    await dataSource.query(
      `UPDATE "core"."pageLayoutWidget" SET "pageLayoutTabId" = $1 WHERE "id" = $2`,
      [originalTab.tabId, replacementTab.widgetIds[0]],
    );

    await runDown();

    await expect(
      readTabAndWidgetState({
        tabId: destinationTab.tabId,
        widgetId: originalTab.widgetIds[0],
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
    await expect(readTabLayoutMode(originalTab.tabId)).resolves.toBe(
      'VERTICAL_LIST',
    );
  });

  it.each([null, { position: { layoutMode: 'CANVAS' } }])(
    'preserves position overrides changed after migration from %j',
    async (widgetOverrides) => {
      const tab = await seedTab({
        layoutMode: 'CANVAS',
        widgetIsActiveValues: [true],
        widgetOverrides,
      });

      await command.runDataMigration(dataSource);

      const updatedOverrides = {
        position: {
          layoutMode: 'VERTICAL_LIST',
          index: 0,
          heightBehavior: 'FIT_CONTENT',
        },
      };

      await dataSource.query(
        `UPDATE "core"."pageLayoutWidget" SET "overrides" = $1 WHERE "id" = $2`,
        [updatedOverrides, tab.widgetIds[0]],
      );

      await runDown();

      await expect(
        readTabAndWidgetState({
          tabId: tab.tabId,
          widgetId: tab.widgetIds[0],
        }),
      ).resolves.toEqual({
        layoutMode: 'VERTICAL_LIST',
        overrides: updatedOverrides,
        position: {
          layoutMode: 'VERTICAL_LIST',
          index: 0,
          heightBehavior: 'TAB_VIEWPORT',
        },
      });
    },
  );

  it.each([null, { position: { layoutMode: 'CANVAS' } }])(
    'preserves a widget moved through a tab override after migrating from %j',
    async (widgetOverrides) => {
      const tab = await seedTab({
        layoutMode: 'CANVAS',
        widgetIsActiveValues: [true],
        widgetOverrides,
      });
      const destinationTab = await seedTab({
        layoutMode: 'VERTICAL_LIST',
        widgetIsActiveValues: [],
      });

      await command.runDataMigration(dataSource);
      await dataSource.query(
        `UPDATE "core"."pageLayoutWidget"
         SET "overrides" = COALESCE(NULLIF("overrides", 'null'::jsonb), '{}'::jsonb) || jsonb_build_object('pageLayoutTabId', $1::text)
         WHERE "id" = $2`,
        [destinationTab.tabId, tab.widgetIds[0]],
      );

      const stateBeforeRollback = await readTabAndWidgetState({
        tabId: tab.tabId,
        widgetId: tab.widgetIds[0],
      });

      await runDown();

      await expect(
        readTabAndWidgetState({ tabId: tab.tabId, widgetId: tab.widgetIds[0] }),
      ).resolves.toEqual(stateBeforeRollback);
    },
  );

  it('does not roll back legacy backups without the original tab override', async () => {
    const tab = await seedTab({
      layoutMode: 'CANVAS',
      widgetIsActiveValues: [true],
    });

    await command.runDataMigration(dataSource);
    await dataSource.query(`
      ALTER TABLE "core"."canvasTabToVerticalListMigrationBackup"
        DROP COLUMN "pageLayoutWidgetTabOverride",
        DROP COLUMN "pageLayoutWidgetTabOverrideWasBackedUp"
    `);

    const stateBeforeRetry = await readTabAndWidgetState({
      tabId: tab.tabId,
      widgetId: tab.widgetIds[0],
    });

    await command.runDataMigration(dataSource);
    await runDown();

    await expect(
      readTabAndWidgetState({ tabId: tab.tabId, widgetId: tab.widgetIds[0] }),
    ).resolves.toEqual(stateBeforeRetry);
  });

  it('preserves tabs receiving an inactive widget through an override after migration', async () => {
    const tab = await seedTab({
      layoutMode: 'CANVAS',
      widgetIsActiveValues: [true],
    });

    await command.runDataMigration(dataSource);

    const incomingWidgetTab = await seedTab({
      layoutMode: 'VERTICAL_LIST',
      widgetIsActiveValues: [false],
      widgetPosition: { layoutMode: 'VERTICAL_LIST', index: 0 },
      widgetOverrides: {
        pageLayoutTabId: tab.tabId,
        position: {
          layoutMode: 'VERTICAL_LIST',
          index: 0,
          heightBehavior: 'FIT_CONTENT',
        },
      },
    });

    await runDown();

    await expect(readTabLayoutMode(tab.tabId)).resolves.toBe('VERTICAL_LIST');
    await expect(
      readTabAndWidgetState({
        tabId: incomingWidgetTab.tabId,
        widgetId: incomingWidgetTab.widgetIds[0],
      }),
    ).resolves.toMatchObject({
      overrides: {
        pageLayoutTabId: tab.tabId,
        position: { layoutMode: 'VERTICAL_LIST' },
      },
    });
  });
});
