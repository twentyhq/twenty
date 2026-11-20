import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { type ConditionalAvailabilityNode } from 'twenty-shared/types';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type ConvertPageLayoutWidgetRulesToConditionalAvailabilityCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795170114689-convert-page-layout-widget-rules-to-conditional-availability.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const TEXT_RULE_WIDGET_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.companyRecordPage.tabs.home.widgets
    .people.universalIdentifier;

const JSON_LOGIC_RULE_WIDGET_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.companyRecordPage.tabs.home.widgets
    .opportunities.universalIdentifier;

const UNREADABLE_RULE_WIDGET_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs.home.widgets
    .company.universalIdentifier;

const PLANTED_WIDGET_UNIVERSAL_IDENTIFIERS = [
  TEXT_RULE_WIDGET_UNIVERSAL_IDENTIFIER,
  JSON_LOGIC_RULE_WIDGET_UNIVERSAL_IDENTIFIER,
  UNREADABLE_RULE_WIDGET_UNIVERSAL_IDENTIFIER,
];

type WidgetRuleRow = {
  universalIdentifier: string;
  conditionalAvailability: ConditionalAvailabilityNode | null;
  conditionalAvailabilityExpression: string | null;
  conditionalDisplay: object | null;
  updatedAt: Date;
};

type WidgetRule = Pick<
  WidgetRuleRow,
  | 'conditionalAvailability'
  | 'conditionalAvailabilityExpression'
  | 'conditionalDisplay'
>;

const PLANTED_RULES: Record<string, WidgetRule> = {
  [TEXT_RULE_WIDGET_UNIVERSAL_IDENTIFIER]: {
    conditionalAvailability: null,
    conditionalAvailabilityExpression: 'device == "MOBILE"',
    conditionalDisplay: null,
  },
  [JSON_LOGIC_RULE_WIDGET_UNIVERSAL_IDENTIFIER]: {
    conditionalAvailability: null,
    conditionalAvailabilityExpression: null,
    conditionalDisplay: { in: ['VIP', { var: 'selectedRecords.0.tags' }] },
  },
  [UNREADABLE_RULE_WIDGET_UNIVERSAL_IDENTIFIER]: {
    conditionalAvailability: null,
    conditionalAvailabilityExpression: 'numberOfSelectedRecords - 1 == 0',
    conditionalDisplay: null,
  },
};

const readPlantedWidgets = async (): Promise<Record<string, WidgetRuleRow>> => {
  const rows: WidgetRuleRow[] = await global.testDataSource.query(
    `SELECT "universalIdentifier", "conditionalAvailability",
            "conditionalAvailabilityExpression", "conditionalDisplay", "updatedAt"
     FROM core."pageLayoutWidget"
     WHERE "workspaceId" = $1 AND "universalIdentifier" = ANY($2::uuid[])`,
    [SEED_APPLE_WORKSPACE_ID, PLANTED_WIDGET_UNIVERSAL_IDENTIFIERS],
  );

  return Object.fromEntries(rows.map((row) => [row.universalIdentifier, row]));
};

describe('2-61 workspace command - convert page layout widget rules to conditional availability (integration)', () => {
  let command: ConvertPageLayoutWidgetRulesToConditionalAvailabilityCommand;
  let workspaceCacheService: WorkspaceCacheService;
  let seededRules: Record<string, WidgetRule>;

  const writeRules = async (rules: Record<string, WidgetRule>) => {
    for (const [universalIdentifier, rule] of Object.entries(rules)) {
      await global.testDataSource.query(
        `UPDATE core."pageLayoutWidget"
         SET "conditionalAvailability" = $3::jsonb,
             "conditionalAvailabilityExpression" = $4,
             "conditionalDisplay" = $5::jsonb
         WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
        [
          SEED_APPLE_WORKSPACE_ID,
          universalIdentifier,
          rule.conditionalAvailability,
          rule.conditionalAvailabilityExpression,
          rule.conditionalDisplay,
        ],
      );
    }

    await workspaceCacheService.invalidateAndRecompute(
      SEED_APPLE_WORKSPACE_ID,
      ['flatPageLayoutWidgetMaps'],
    );
  };

  beforeAll(async () => {
    command =
      getAppProviderByClassName<ConvertPageLayoutWidgetRulesToConditionalAvailabilityCommand>(
        'ConvertPageLayoutWidgetRulesToConditionalAvailabilityCommand',
      );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );

    const seededWidgets = await readPlantedWidgets();

    seededRules = Object.fromEntries(
      PLANTED_WIDGET_UNIVERSAL_IDENTIFIERS.map((universalIdentifier) => [
        universalIdentifier,
        {
          conditionalAvailability:
            seededWidgets[universalIdentifier].conditionalAvailability,
          conditionalAvailabilityExpression:
            seededWidgets[universalIdentifier]
              .conditionalAvailabilityExpression,
          conditionalDisplay:
            seededWidgets[universalIdentifier].conditionalDisplay,
        },
      ]),
    );
  });

  afterAll(async () => {
    await writeRules(seededRules);
  });

  it('changes nothing on a dry run', async () => {
    await writeRules(PLANTED_RULES);

    await command.runOnWorkspace({
      ...RUN_ON_WORKSPACE_ARGS,
      options: { dryRun: true },
    });

    const widgets = await readPlantedWidgets();

    for (const universalIdentifier of PLANTED_WIDGET_UNIVERSAL_IDENTIFIERS) {
      expect(widgets[universalIdentifier]).toMatchObject(
        PLANTED_RULES[universalIdentifier],
      );
    }
  });

  it('stores each planted rule as a tree, empties the old columns and changes nothing on a second run', async () => {
    await writeRules(PLANTED_RULES);

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    const widgets = await readPlantedWidgets();

    expect(widgets[TEXT_RULE_WIDGET_UNIVERSAL_IDENTIFIER]).toMatchObject({
      conditionalAvailability: {
        type: 'COMPARISON',
        operator: 'EQUAL',
        left: { type: 'PATH', path: 'device' },
        right: { type: 'LITERAL', value: 'MOBILE' },
      },
      conditionalAvailabilityExpression: null,
      conditionalDisplay: null,
    });
    expect(widgets[JSON_LOGIC_RULE_WIDGET_UNIVERSAL_IDENTIFIER]).toMatchObject({
      conditionalAvailability: {
        type: 'CALL',
        functionName: 'includesSome',
        arguments: [
          { type: 'PATH', path: 'selectedRecords' },
          { type: 'LITERAL', value: 'tags' },
          { type: 'LITERAL', value: 'VIP' },
        ],
      },
      conditionalAvailabilityExpression: null,
      conditionalDisplay: null,
    });
    expect(widgets[UNREADABLE_RULE_WIDGET_UNIVERSAL_IDENTIFIER]).toMatchObject({
      conditionalAvailability: { type: 'LITERAL', value: false },
      conditionalAvailabilityExpression: null,
      conditionalDisplay: null,
    });

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await readPlantedWidgets()).toEqual(widgets);
  });
});
