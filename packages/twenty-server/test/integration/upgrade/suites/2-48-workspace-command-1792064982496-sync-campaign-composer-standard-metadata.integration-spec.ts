import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type SyncCampaignComposerStandardMetadataCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1792064982496-sync-campaign-composer-standard-metadata.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const DRY_RUN_ON_WORKSPACE_ARGS = {
  ...RUN_ON_WORKSPACE_ARGS,
  options: { dryRun: true },
};

const MESSAGE_CAMPAIGN_FIELDS = STANDARD_OBJECTS.messageCampaign.fields;

const COUNT_FIELD_UNIVERSAL_IDENTIFIERS = [
  MESSAGE_CAMPAIGN_FIELDS.sentCount.universalIdentifier,
  MESSAGE_CAMPAIGN_FIELDS.deliveredCount.universalIdentifier,
  MESSAGE_CAMPAIGN_FIELDS.failedCount.universalIdentifier,
  MESSAGE_CAMPAIGN_FIELDS.bouncedCount.universalIdentifier,
  MESSAGE_CAMPAIGN_FIELDS.complainedCount.universalIdentifier,
  MESSAGE_CAMPAIGN_FIELDS.skippedCount.universalIdentifier,
];

const PREVIOUS_CAMPAIGN_COMPOSER_STATE = {
  countFieldLabels: {
    sentCount: 'Sent count',
    deliveredCount: 'Delivered count',
    failedCount: 'Failed count',
    bouncedCount: 'Bounced count',
    complainedCount: 'Complained count',
    skippedCount: 'Skipped count',
  },
  emailBlockSettings: {
    label: 'Block Settings',
    shortLabel: 'Design',
    icon: 'IconAdjustments',
  },
  hasEmailPageStyle: false,
  isMessageListMemberUICreatable: true,
};

const CURRENT_CAMPAIGN_COMPOSER_STATE = {
  countFieldLabels: {
    sentCount: 'Sent',
    deliveredCount: 'Delivered',
    failedCount: 'Failed',
    bouncedCount: 'Bounced',
    complainedCount: 'Complaints',
    skippedCount: 'Skipped',
  },
  emailBlockSettings: {
    label: 'Add Block',
    shortLabel: 'Add Block',
    icon: 'IconPlus',
  },
  hasEmailPageStyle: true,
  isMessageListMemberUICreatable: false,
};

const readCampaignComposerState = async () => {
  const countFields: { name: string; label: string }[] =
    await global.testDataSource.query(
      `SELECT name, label FROM core."fieldMetadata"
       WHERE "workspaceId" = $1 AND "universalIdentifier" = ANY($2)`,
      [SEED_APPLE_WORKSPACE_ID, COUNT_FIELD_UNIVERSAL_IDENTIFIERS],
    );

  const [emailBlockSettings]: {
    label: string;
    shortLabel: string | null;
    icon: string | null;
  }[] = await global.testDataSource.query(
    `SELECT label, "shortLabel", icon FROM core."commandMenuItem"
     WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
    [
      SEED_APPLE_WORKSPACE_ID,
      STANDARD_COMMAND_MENU_ITEMS.emailBlockSettings.universalIdentifier,
    ],
  );

  const emailPageStyles: { id: string }[] = await global.testDataSource.query(
    `SELECT id FROM core."commandMenuItem"
     WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
    [
      SEED_APPLE_WORKSPACE_ID,
      STANDARD_COMMAND_MENU_ITEMS.emailPageStyle.universalIdentifier,
    ],
  );

  const [messageListMember]: { isUICreatable: boolean }[] =
    await global.testDataSource.query(
      `SELECT "isUICreatable" FROM core."objectMetadata"
       WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
      [
        SEED_APPLE_WORKSPACE_ID,
        STANDARD_OBJECTS.messageListMember.universalIdentifier,
      ],
    );

  return {
    countFieldLabels: Object.fromEntries(
      countFields.map(({ name, label }) => [name, label]),
    ),
    emailBlockSettings,
    hasEmailPageStyle: emailPageStyles.length > 0,
    isMessageListMemberUICreatable: messageListMember.isUICreatable,
  };
};

describe('2-48 workspace command - sync campaign composer standard metadata (integration)', () => {
  let command: SyncCampaignComposerStandardMetadataCommand;
  let workspaceCacheService: WorkspaceCacheService;

  beforeAll(() => {
    command =
      getAppProviderByClassName<SyncCampaignComposerStandardMetadataCommand>(
        'SyncCampaignComposerStandardMetadataCommand',
      );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
  });

  afterAll(async () => {
    await command.up(RUN_ON_WORKSPACE_ARGS);
  });

  it('restores the previous campaign defaults on down and writes nothing on a dry run', async () => {
    await command.down(RUN_ON_WORKSPACE_ARGS);

    expect(await readCampaignComposerState()).toEqual(
      PREVIOUS_CAMPAIGN_COMPOSER_STATE,
    );

    await command.up(DRY_RUN_ON_WORKSPACE_ARGS);

    expect(await readCampaignComposerState()).toEqual(
      PREVIOUS_CAMPAIGN_COMPOSER_STATE,
    );
  });

  it('moves the previous campaign defaults to the current standard metadata and is a no-op on a second run', async () => {
    await command.down(RUN_ON_WORKSPACE_ARGS);
    await command.up(RUN_ON_WORKSPACE_ARGS);
    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await readCampaignComposerState()).toEqual(
      CURRENT_CAMPAIGN_COMPOSER_STATE,
    );

    const { flatFieldMetadataMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatFieldMetadataMaps',
      ]);

    expect(
      flatFieldMetadataMaps.byUniversalIdentifier[
        MESSAGE_CAMPAIGN_FIELDS.complainedCount.universalIdentifier
      ]?.label,
    ).toBe('Complaints');
  });
});
