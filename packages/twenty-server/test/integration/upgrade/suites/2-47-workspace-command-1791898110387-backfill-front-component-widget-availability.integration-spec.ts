import { randomUUID } from 'node:crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { PageLayoutType } from 'twenty-shared/types';

import { type BackfillFrontComponentWidgetAvailabilityCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791898110387-backfill-front-component-widget-availability.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const DEFAULT_WIDGET_AVAILABILITY = [
  { pageLayoutType: PageLayoutType.RECORD_PAGE },
  { pageLayoutType: PageLayoutType.DASHBOARD },
];

const DASHBOARD_ONLY_WIDGET_AVAILABILITY = [
  { pageLayoutType: PageLayoutType.DASHBOARD },
];

type SeededFrontComponent = {
  id: string;
  workspaceId: string;
  applicationId: string;
  isHeadless: boolean;
  widgetAvailability: { pageLayoutType: PageLayoutType }[];
};

const OWNER_APPLICATION_ID = randomUUID();
const OTHER_APPLICATION_ID = randomUUID();
const OTHER_WORKSPACE_APPLICATION_ID = randomUUID();

const buildFrontComponent = (
  overrides: Partial<SeededFrontComponent> = {},
): SeededFrontComponent => ({
  id: randomUUID(),
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  applicationId: OWNER_APPLICATION_ID,
  isHeadless: false,
  widgetAvailability: DEFAULT_WIDGET_AVAILABILITY,
  ...overrides,
});

const FRONT_COMPONENTS = {
  regular: buildFrontComponent(),
  headless: buildFrontComponent({ isHeadless: true }),
  legacySettingsTab: buildFrontComponent(),
  settingsMenuItem: buildFrontComponent(),
  otherApplicationSettingsMenuItem: buildFrontComponent(),
  commandMenuItem: buildFrontComponent(),
  customizedHeadless: buildFrontComponent({
    isHeadless: true,
    widgetAvailability: DASHBOARD_ONLY_WIDGET_AVAILABILITY,
  }),
  otherWorkspaceHeadless: buildFrontComponent({
    workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
    applicationId: OTHER_WORKSPACE_APPLICATION_ID,
    isHeadless: true,
  }),
} satisfies Record<string, SeededFrontComponent>;

type FrontComponentKey = keyof typeof FRONT_COMPONENTS;

const NOT_OFFERED_BY_DEFAULT_KEYS: FrontComponentKey[] = [
  'headless',
  'legacySettingsTab',
  'settingsMenuItem',
];

const insertApplication = (id: string, workspaceId: string) =>
  global.testDataSource.query(
    `INSERT INTO core."application" (id, "universalIdentifier", name, "sourcePath", "workspaceId")
     VALUES ($1, $2, 'Widget availability backfill test', 'widget-availability-backfill', $3)`,
    [id, randomUUID(), workspaceId],
  );

const insertFrontComponent = ({
  id,
  workspaceId,
  applicationId,
  isHeadless,
}: SeededFrontComponent) =>
  global.testDataSource.query(
    `INSERT INTO core."frontComponent" (id, "workspaceId", "universalIdentifier", "applicationId", name,
       "sourceComponentPath", "builtComponentPath", "componentName", "builtComponentChecksum", "isHeadless")
     VALUES ($1, $2, $3, $4, 'Widget availability backfill test',
       'src/component.tsx', 'dist/component.mjs', 'Component', 'checksum', $5)`,
    [id, workspaceId, randomUUID(), applicationId, isHeadless],
  );

const insertSettingsMenuItem = ({
  applicationId,
  frontComponentId,
}: {
  applicationId: string;
  frontComponentId: string;
}) =>
  global.testDataSource.query(
    `INSERT INTO core."settingsMenuItem" ("workspaceId", "universalIdentifier", "applicationId", "frontComponentId", title)
     VALUES ($1, $2, $3, $4, 'Widget availability backfill test')`,
    [SEED_APPLE_WORKSPACE_ID, randomUUID(), applicationId, frontComponentId],
  );

const setWidgetAvailability = (
  frontComponentId: string,
  widgetAvailability: { pageLayoutType: PageLayoutType }[],
) =>
  global.testDataSource.query(
    `UPDATE core."frontComponent" SET "widgetAvailability" = $2::jsonb WHERE id = $1`,
    [frontComponentId, JSON.stringify(widgetAvailability)],
  );

const readWidgetAvailabilityByKey = async (): Promise<
  Record<string, unknown>
> => {
  const rows: { id: string; widgetAvailability: unknown }[] =
    await global.testDataSource.query(
      `SELECT id, "widgetAvailability" FROM core."frontComponent" WHERE id = ANY($1::uuid[])`,
      [Object.values(FRONT_COMPONENTS).map(({ id }) => id)],
    );

  const widgetAvailabilityById = new Map(
    rows.map(({ id, widgetAvailability }) => [id, widgetAvailability]),
  );

  return Object.fromEntries(
    Object.entries(FRONT_COMPONENTS).map(([key, { id }]) => [
      key,
      widgetAvailabilityById.get(id),
    ]),
  );
};

const getSeededWidgetAvailabilityByKey = () =>
  Object.fromEntries(
    Object.entries(FRONT_COMPONENTS).map(([key, { widgetAvailability }]) => [
      key,
      widgetAvailability,
    ]),
  );

describe('2-47 workspace command - backfill front component widget availability (integration)', () => {
  let command: BackfillFrontComponentWidgetAvailabilityCommand;
  let workspaceCacheService: WorkspaceCacheService;

  beforeAll(async () => {
    command =
      getAppProviderByClassName<BackfillFrontComponentWidgetAvailabilityCommand>(
        'BackfillFrontComponentWidgetAvailabilityCommand',
      );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );

    await insertApplication(OWNER_APPLICATION_ID, SEED_APPLE_WORKSPACE_ID);
    await insertApplication(OTHER_APPLICATION_ID, SEED_APPLE_WORKSPACE_ID);
    await insertApplication(
      OTHER_WORKSPACE_APPLICATION_ID,
      SEED_YCOMBINATOR_WORKSPACE_ID,
    );

    for (const frontComponent of Object.values(FRONT_COMPONENTS)) {
      await insertFrontComponent(frontComponent);
    }

    await global.testDataSource.query(
      `UPDATE core."application" SET "settingsCustomTabFrontComponentId" = $2 WHERE id = $1`,
      [OWNER_APPLICATION_ID, FRONT_COMPONENTS.legacySettingsTab.id],
    );
    await insertSettingsMenuItem({
      applicationId: OWNER_APPLICATION_ID,
      frontComponentId: FRONT_COMPONENTS.settingsMenuItem.id,
    });
    await insertSettingsMenuItem({
      applicationId: OTHER_APPLICATION_ID,
      frontComponentId: FRONT_COMPONENTS.otherApplicationSettingsMenuItem.id,
    });
    await global.testDataSource.query(
      `INSERT INTO core."commandMenuItem" ("workspaceId", "universalIdentifier", "applicationId", "frontComponentId", label, "engineComponentKey")
       VALUES ($1, $2, $3, $4, 'Widget availability backfill test', 'FRONT_COMPONENT_RENDERER')`,
      [
        SEED_APPLE_WORKSPACE_ID,
        randomUUID(),
        OWNER_APPLICATION_ID,
        FRONT_COMPONENTS.commandMenuItem.id,
      ],
    );
  });

  beforeEach(async () => {
    for (const { id, widgetAvailability } of Object.values(FRONT_COMPONENTS)) {
      await setWidgetAvailability(id, widgetAvailability);
    }
  });

  afterAll(async () => {
    await global.testDataSource.query(
      `DELETE FROM core."application" WHERE id = ANY($1::uuid[])`,
      [
        [
          OWNER_APPLICATION_ID,
          OTHER_APPLICATION_ID,
          OTHER_WORKSPACE_APPLICATION_ID,
        ],
      ],
    );

    for (const workspaceId of [
      SEED_APPLE_WORKSPACE_ID,
      SEED_YCOMBINATOR_WORKSPACE_ID,
    ]) {
      await workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatFrontComponentMaps',
      ]);
    }
  });

  it('only empties the default of headless components and those opened from a settings menu item of their own application', async () => {
    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await readWidgetAvailabilityByKey()).toEqual({
      regular: DEFAULT_WIDGET_AVAILABILITY,
      headless: [],
      legacySettingsTab: [],
      settingsMenuItem: [],
      otherApplicationSettingsMenuItem: DEFAULT_WIDGET_AVAILABILITY,
      commandMenuItem: DEFAULT_WIDGET_AVAILABILITY,
      customizedHeadless: DASHBOARD_ONLY_WIDGET_AVAILABILITY,
      otherWorkspaceHeadless: DEFAULT_WIDGET_AVAILABILITY,
    });
  });

  it('is idempotent', async () => {
    await command.up(RUN_ON_WORKSPACE_ARGS);
    const afterFirstRun = await readWidgetAvailabilityByKey();

    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await readWidgetAvailabilityByKey()).toEqual(afterFirstRun);
  });

  it('changes nothing in dry run', async () => {
    await command.up({ ...RUN_ON_WORKSPACE_ARGS, options: { dryRun: true } });

    expect(await readWidgetAvailabilityByKey()).toEqual(
      getSeededWidgetAvailabilityByKey(),
    );
  });

  it('refreshes the cached front components', async () => {
    await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatFrontComponentMaps',
    ]);

    await command.up(RUN_ON_WORKSPACE_ARGS);

    const { flatFrontComponentMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatFrontComponentMaps',
      ]);
    const cachedFrontComponents = Object.values(
      flatFrontComponentMaps.byUniversalIdentifier,
    );

    for (const key of NOT_OFFERED_BY_DEFAULT_KEYS) {
      expect(
        cachedFrontComponents.find(
          (frontComponent) => frontComponent?.id === FRONT_COMPONENTS[key].id,
        )?.universalWidgetAvailability,
      ).toEqual([]);
    }
  });

  it('restores the default on down without touching components emptied for another reason', async () => {
    await setWidgetAvailability(FRONT_COMPONENTS.regular.id, []);
    await command.up(RUN_ON_WORKSPACE_ARGS);

    await command.down(RUN_ON_WORKSPACE_ARGS);

    expect(await readWidgetAvailabilityByKey()).toEqual({
      ...getSeededWidgetAvailabilityByKey(),
      regular: [],
    });
  });
});
