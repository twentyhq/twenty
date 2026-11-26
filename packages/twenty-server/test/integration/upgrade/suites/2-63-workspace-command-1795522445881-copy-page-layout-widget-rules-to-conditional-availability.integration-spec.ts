import {
  buildDeviceConditionalEvaluationNode,
  type ConditionalEvaluationNode,
} from 'twenty-shared/conditional-evaluation';
import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { FeatureFlagKey } from 'twenty-shared/types';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type CopyPageLayoutWidgetRulesToConditionalAvailabilityCommand } from 'src/database/commands/upgrade-version-command/2-63/2-63-workspace-command-1795522445881-copy-page-layout-widget-rules-to-conditional-availability.command';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
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

type WidgetRule = {
  conditionalAvailability: ConditionalEvaluationNode | null;
  conditionalAvailabilityExpression: string | null;
  conditionalDisplay: object | null;
};

type WidgetRuleRow = WidgetRule & { universalIdentifier: string };

const PLANTED_RULES: Record<string, WidgetRule> = {
  [TEXT_RULE_WIDGET_UNIVERSAL_IDENTIFIER]: {
    conditionalAvailability: null,
    conditionalAvailabilityExpression: 'device == "MOBILE"',
    conditionalDisplay: null,
  },
  [JSON_LOGIC_RULE_WIDGET_UNIVERSAL_IDENTIFIER]: {
    conditionalAvailability: null,
    conditionalAvailabilityExpression: null,
    conditionalDisplay: { and: [{ '===': [{ var: 'device' }, 'DESKTOP'] }] },
  },
  [UNREADABLE_RULE_WIDGET_UNIVERSAL_IDENTIFIER]: {
    conditionalAvailability: null,
    conditionalAvailabilityExpression: 'numberOfSelectedRecords - 1 == 0',
    conditionalDisplay: null,
  },
};

const readPlantedWidgetRules = async (): Promise<
  Record<string, WidgetRule>
> => {
  const rows: WidgetRuleRow[] = await global.testDataSource.query(
    `SELECT "universalIdentifier", "conditionalAvailability",
            "conditionalAvailabilityExpression", "conditionalDisplay"
     FROM core."pageLayoutWidget"
     WHERE "workspaceId" = $1 AND "universalIdentifier" = ANY($2::uuid[])`,
    [SEED_APPLE_WORKSPACE_ID, PLANTED_WIDGET_UNIVERSAL_IDENTIFIERS],
  );

  return Object.fromEntries(
    rows.map(({ universalIdentifier, ...rule }) => [universalIdentifier, rule]),
  );
};

describe('2-63 workspace command - copy page layout widget rules to conditional availability (integration)', () => {
  let command: CopyPageLayoutWidgetRulesToConditionalAvailabilityCommand;
  let workspaceCacheService: WorkspaceCacheService;
  let featureFlagService: FeatureFlagService;
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

  const setWorkspaceReadsTreeOnly = async (value: boolean) => {
    await featureFlagService.upsertWorkspaceFeatureFlag({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      featureFlag: FeatureFlagKey.IS_WIDGET_CONDITIONAL_AVAILABILITY_ENABLED,
      value,
    });
  };

  const doesWorkspaceReadTreeOnly = () =>
    featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_WIDGET_CONDITIONAL_AVAILABILITY_ENABLED,
      SEED_APPLE_WORKSPACE_ID,
    );

  beforeAll(async () => {
    command =
      getAppProviderByClassName<CopyPageLayoutWidgetRulesToConditionalAvailabilityCommand>(
        'CopyPageLayoutWidgetRulesToConditionalAvailabilityCommand',
      );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    featureFlagService =
      getAppProviderByClassName<FeatureFlagService>('FeatureFlagService');

    seededRules = await readPlantedWidgetRules();
  });

  beforeEach(async () => {
    await setWorkspaceReadsTreeOnly(false);
  });

  afterAll(async () => {
    await writeRules(seededRules);
    await setWorkspaceReadsTreeOnly(true);
  });

  it('changes nothing on a dry run', async () => {
    await writeRules(PLANTED_RULES);

    await command.runOnWorkspace({
      ...RUN_ON_WORKSPACE_ARGS,
      options: { dryRun: true },
    });

    expect(await readPlantedWidgetRules()).toEqual(PLANTED_RULES);
    expect(await doesWorkspaceReadTreeOnly()).toBe(false);
  });

  it('copies each readable rule into a tree, keeps every legacy value and changes nothing on a second run', async () => {
    await writeRules(PLANTED_RULES);

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    const widgetRules = await readPlantedWidgetRules();

    expect(widgetRules).toEqual({
      [TEXT_RULE_WIDGET_UNIVERSAL_IDENTIFIER]: {
        ...PLANTED_RULES[TEXT_RULE_WIDGET_UNIVERSAL_IDENTIFIER],
        conditionalAvailability: buildDeviceConditionalEvaluationNode('MOBILE'),
      },
      [JSON_LOGIC_RULE_WIDGET_UNIVERSAL_IDENTIFIER]: {
        ...PLANTED_RULES[JSON_LOGIC_RULE_WIDGET_UNIVERSAL_IDENTIFIER],
        conditionalAvailability:
          buildDeviceConditionalEvaluationNode('DESKTOP'),
      },
      [UNREADABLE_RULE_WIDGET_UNIVERSAL_IDENTIFIER]:
        PLANTED_RULES[UNREADABLE_RULE_WIDGET_UNIVERSAL_IDENTIFIER],
    });

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await readPlantedWidgetRules()).toEqual(widgetRules);
  });

  it('keeps the workspace on its legacy rules while one of them cannot be read', async () => {
    await writeRules(PLANTED_RULES);

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await doesWorkspaceReadTreeOnly()).toBe(false);
  });

  it('makes the workspace read the tree only once every rule is copied', async () => {
    await writeRules({
      ...PLANTED_RULES,
      [UNREADABLE_RULE_WIDGET_UNIVERSAL_IDENTIFIER]:
        seededRules[UNREADABLE_RULE_WIDGET_UNIVERSAL_IDENTIFIER],
    });

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await doesWorkspaceReadTreeOnly()).toBe(true);
  });
});
