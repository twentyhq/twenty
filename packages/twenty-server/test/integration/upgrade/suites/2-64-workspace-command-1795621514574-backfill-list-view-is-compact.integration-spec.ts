import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import { updateOneView } from 'test/integration/metadata/suites/view/utils/update-one-view.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { ViewKey, ViewType } from 'twenty-shared/types';

import { type BackfillListViewIsCompactCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-workspace-command-1795621514574-backfill-list-view-is-compact.command';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

describe('2-64 workspace command - backfill list view is compact (integration)', () => {
  let command: BackfillListViewIsCompactCommand;
  let objectMetadataId: string;
  let viewIds: string[];

  const runCommand = (options: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options,
      index: 0,
      total: 1,
    });

  const readViews = async () => {
    const { data } = await findViews({ objectMetadataId, expectToFail: false });

    return data.getViews
      .filter(({ id }) => viewIds.includes(id))
      .map(({ name, type, isCompact }) => ({ name, type, isCompact }))
      .sort((viewA, viewB) => viewA.name.localeCompare(viewB.name));
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<BackfillListViewIsCompactCommand>(
      'BackfillListViewIsCompactCommand',
    );

    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'compactBackfillTestObject',
        namePlural: 'compactBackfillTestObjects',
        labelSingular: 'Compact Backfill Test Object',
        labelPlural: 'Compact Backfill Test Objects',
        icon: 'IconList',
      },
    });

    objectMetadataId = data.createOneObject.id;

    const { data: viewsData } = await findViews({
      objectMetadataId,
      expectToFail: false,
    });
    const indexViewId =
      viewsData.getViews.find(({ key }) => key === ViewKey.INDEX)?.id ?? '';

    await updateOneView({
      viewId: indexViewId,
      input: {
        id: indexViewId,
        name: 'A - index view shown as a list',
        type: ViewType.LIST,
        isCompact: false,
      },
      expectToFail: false,
    });
    const { data: listViewData } = await createOneView({
      input: {
        name: 'B - list view',
        objectMetadataId,
        icon: 'IconList',
        type: ViewType.LIST,
        isCompact: false,
      },
      expectToFail: false,
    });
    const { data: tableViewData } = await createOneView({
      input: {
        name: 'C - table view',
        objectMetadataId,
        icon: 'IconTable',
        type: ViewType.TABLE,
      },
      expectToFail: false,
    });

    viewIds = [
      indexViewId,
      listViewData.createView.id,
      tableViewData.createView.id,
    ];
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: objectMetadataId },
    });
  });

  it('changes nothing on a dry run', async () => {
    const viewsBefore = await readViews();

    await runCommand({ dryRun: true });

    expect(await readViews()).toEqual(viewsBefore);
  });

  it('sets list views to compact and leaves other layouts alone, on every run', async () => {
    await runCommand();
    await runCommand();

    expect(await readViews()).toEqual([
      {
        name: 'A - index view shown as a list',
        type: ViewType.LIST,
        isCompact: true,
      },
      { name: 'B - list view', type: ViewType.LIST, isCompact: true },
      { name: 'C - table view', type: ViewType.TABLE, isCompact: false },
    ]);
  });
});
