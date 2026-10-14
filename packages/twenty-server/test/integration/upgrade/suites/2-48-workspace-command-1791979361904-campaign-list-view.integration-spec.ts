import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  getSystemViewFieldUniversalIdentifier,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { ViewKey, ViewType } from 'twenty-shared/types';

import { type RemoveCampaignListStatColumnsCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1791979361903-remove-campaign-list-stat-columns.command';
import { type AddCampaignListViewCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1791979361904-add-campaign-list-view.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const CAMPAIGN = STANDARD_OBJECTS.messageCampaign;

const INDEX_VIEW_UNIVERSAL_IDENTIFIER =
  CAMPAIGN.views.allMessageCampaigns.universalIdentifier;

const LIST_VIEW_UNIVERSAL_IDENTIFIER =
  CAMPAIGN.views.messageCampaignList.universalIdentifier;

const STAT_FIELD_NAMES = [
  'sentCount',
  'deliveredCount',
  'failedCount',
  'skippedCount',
  'bouncedCount',
  'complainedCount',
  'uniqueClickCount',
  'clickRate',
  'uniqueOpenCount',
  'openRate',
] as const;

const readViewColumnFieldNames = async (viewUniversalIdentifier: string) => {
  const rows: { name: string }[] = await global.testDataSource.query(
    `SELECT f.name
     FROM core."viewField" vf
     JOIN core.view v ON v.id = vf."viewId"
     JOIN core."fieldMetadata" f ON f.id = vf."fieldMetadataId"
     WHERE v."workspaceId" = $1 AND v."universalIdentifier" = $2
       AND vf."deletedAt" IS NULL
     ORDER BY vf.position`,
    [SEED_APPLE_WORKSPACE_ID, viewUniversalIdentifier],
  );

  return rows.map(({ name }) => name);
};

const readView = async (viewUniversalIdentifier: string) => {
  const [view]: {
    id: string;
    type: string;
    key: string | null;
    position: number;
  }[] = await global.testDataSource.query(
    `SELECT id, type, key, position
     FROM core.view
     WHERE "workspaceId" = $1 AND "universalIdentifier" = $2
       AND "deletedAt" IS NULL`,
    [SEED_APPLE_WORKSPACE_ID, viewUniversalIdentifier],
  );

  return view;
};

describe('2-48 workspace commands - campaign list view (integration)', () => {
  let removeStatColumnsCommand: RemoveCampaignListStatColumnsCommand;
  let addListViewCommand: AddCampaignListViewCommand;
  let workspaceCacheService: WorkspaceCacheService;

  const invalidateViewCaches = () =>
    workspaceCacheService.invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatViewMaps',
      'flatViewFieldMaps',
    ]);

  const addStatColumnsToIndexView = async () => {
    for (const [index, fieldName] of STAT_FIELD_NAMES.entries()) {
      await global.testDataSource.query(
        `INSERT INTO core."viewField"
           ("fieldMetadataId", "viewId", "workspaceId", "universalIdentifier", "applicationId", position)
         SELECT f.id, v.id, v."workspaceId", $3, v."applicationId", $5
         FROM core.view v
         JOIN core."fieldMetadata" f
           ON f."workspaceId" = v."workspaceId" AND f."universalIdentifier" = $4
         WHERE v."workspaceId" = $1 AND v."universalIdentifier" = $2`,
        [
          SEED_APPLE_WORKSPACE_ID,
          INDEX_VIEW_UNIVERSAL_IDENTIFIER,
          getSystemViewFieldUniversalIdentifier({
            fieldMetadataApplicationUniversalIdentifier:
              TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
            viewUniversalIdentifier: INDEX_VIEW_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier:
              CAMPAIGN.fields[fieldName].universalIdentifier,
          }),
          CAMPAIGN.fields[fieldName].universalIdentifier,
          100 + index,
        ],
      );
    }

    await invalidateViewCaches();
  };

  const setIndexViewType = async (type: ViewType) => {
    await global.testDataSource.query(
      `UPDATE core.view SET type = $3
       WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
      [SEED_APPLE_WORKSPACE_ID, INDEX_VIEW_UNIVERSAL_IDENTIFIER, type],
    );

    await invalidateViewCaches();
  };

  beforeAll(() => {
    removeStatColumnsCommand =
      getAppProviderByClassName<RemoveCampaignListStatColumnsCommand>(
        'RemoveCampaignListStatColumnsCommand',
      );
    addListViewCommand = getAppProviderByClassName<AddCampaignListViewCommand>(
      'AddCampaignListViewCommand',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
  });

  afterAll(async () => {
    await removeStatColumnsCommand.up(RUN_ON_WORKSPACE_ARGS);
    await addListViewCommand.up(RUN_ON_WORKSPACE_ARGS);
  });

  it('removes the stat columns from the INDEX view and keeps the others', async () => {
    const columnsBefore = await readViewColumnFieldNames(
      INDEX_VIEW_UNIVERSAL_IDENTIFIER,
    );

    await addStatColumnsToIndexView();

    expect(
      await readViewColumnFieldNames(INDEX_VIEW_UNIVERSAL_IDENTIFIER),
    ).toEqual([...columnsBefore, ...STAT_FIELD_NAMES]);

    await removeStatColumnsCommand.up(RUN_ON_WORKSPACE_ARGS);

    expect(
      await readViewColumnFieldNames(INDEX_VIEW_UNIVERSAL_IDENTIFIER),
    ).toEqual(columnsBefore);
  });

  it('leaves the workspace untouched on a dry run', async () => {
    await addListViewCommand.down(RUN_ON_WORKSPACE_ARGS);
    await setIndexViewType(ViewType.LIST);

    await addListViewCommand.up({
      ...RUN_ON_WORKSPACE_ARGS,
      options: { dryRun: true },
    });

    expect((await readView(INDEX_VIEW_UNIVERSAL_IDENTIFIER))?.type).toBe(
      ViewType.LIST,
    );
    expect(await readView(LIST_VIEW_UNIVERSAL_IDENTIFIER)).toBeUndefined();
  });

  it('turns a LIST INDEX view back into a table and adds the list view on top', async () => {
    await addListViewCommand.down(RUN_ON_WORKSPACE_ARGS);
    await setIndexViewType(ViewType.LIST);

    await addListViewCommand.up(RUN_ON_WORKSPACE_ARGS);

    expect(await readView(INDEX_VIEW_UNIVERSAL_IDENTIFIER)).toMatchObject({
      type: ViewType.TABLE,
      key: ViewKey.INDEX,
      position: 0,
    });
    expect(await readView(LIST_VIEW_UNIVERSAL_IDENTIFIER)).toMatchObject({
      type: ViewType.LIST,
      key: null,
      position: 1,
    });
    expect(
      await readViewColumnFieldNames(LIST_VIEW_UNIVERSAL_IDENTIFIER),
    ).toEqual(Object.keys(CAMPAIGN.views.messageCampaignList.viewFields));
  });

  it('changes nothing when run again', async () => {
    const listViewBefore = await readView(LIST_VIEW_UNIVERSAL_IDENTIFIER);
    const indexViewBefore = await readView(INDEX_VIEW_UNIVERSAL_IDENTIFIER);

    await removeStatColumnsCommand.up(RUN_ON_WORKSPACE_ARGS);
    await addListViewCommand.up(RUN_ON_WORKSPACE_ARGS);

    expect(await readView(LIST_VIEW_UNIVERSAL_IDENTIFIER)).toEqual(
      listViewBefore,
    );
    expect(await readView(INDEX_VIEW_UNIVERSAL_IDENTIFIER)).toEqual(
      indexViewBefore,
    );
  });
});
