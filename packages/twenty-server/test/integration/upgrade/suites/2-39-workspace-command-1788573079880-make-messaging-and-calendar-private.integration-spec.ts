import { setObjectReadability } from 'test/integration/metadata/suites/object-metadata/utils/set-object-readability.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { MetadataReadability } from 'twenty-shared/types';
import { In } from 'typeorm';

import { MakeMessagingAndCalendarPrivateCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788573079880-make-messaging-and-calendar-private.command';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const authContext = buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID);

const OBJECT_NAMES_SINGULAR = ['message', 'messageThread', 'calendarEvent'];

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

describe('2-39 workspace command 1788573079880 - MakeMessagingAndCalendarPrivateCommand (integration)', () => {
  let command: MakeMessagingAndCalendarPrivateCommand;
  let workspaceOrmManager: WorkspaceOrmManager;
  let objectMetadataIds: string[];

  const runCommand = (options: { dryRun?: boolean } = {}) =>
    workspaceOrmManager.executeInWorkspaceContext(
      () => command.runOnWorkspace({ ...RUN_ON_WORKSPACE_ARGS, options }),
      authContext,
    );

  const findReadabilities = async (): Promise<
    Record<string, MetadataReadability>
  > => {
    const objectMetadataItems = await getCoreRepository<ObjectMetadataEntity>(
      ObjectMetadataEntity,
    ).find({
      where: {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        nameSingular: In(OBJECT_NAMES_SINGULAR),
      },
    });

    return Object.fromEntries(
      objectMetadataItems.map((objectMetadata) => [
        objectMetadata.nameSingular,
        objectMetadata.readability,
      ]),
    );
  };

  const setReadabilities = async (readability: MetadataReadability) => {
    for (const objectMetadataId of objectMetadataIds) {
      await setObjectReadability(objectMetadataId, readability);
    }
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<MakeMessagingAndCalendarPrivateCommand>(
      'MakeMessagingAndCalendarPrivateCommand',
    );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );

    const objectMetadataItems = await getCoreRepository<ObjectMetadataEntity>(
      ObjectMetadataEntity,
    ).find({
      where: {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        nameSingular: In(OBJECT_NAMES_SINGULAR),
      },
    });

    expect(objectMetadataItems).toHaveLength(OBJECT_NAMES_SINGULAR.length);

    objectMetadataIds = objectMetadataItems.map(
      (objectMetadata) => objectMetadata.id,
    );

    await setReadabilities(MetadataReadability.OPEN);
  });

  afterAll(async () => {
    await setReadabilities(MetadataReadability.PRIVATE);
  });

  it('leaves the objects OPEN on a dry run', async () => {
    await runCommand({ dryRun: true });

    expect(await findReadabilities()).toEqual({
      message: MetadataReadability.OPEN,
      messageThread: MetadataReadability.OPEN,
      calendarEvent: MetadataReadability.OPEN,
    });
  });

  it('makes message, messageThread and calendarEvent PRIVATE and skips them on a second run', async () => {
    await runCommand();
    await runCommand();

    expect(await findReadabilities()).toEqual({
      message: MetadataReadability.PRIVATE,
      messageThread: MetadataReadability.PRIVATE,
      calendarEvent: MetadataReadability.PRIVATE,
    });
  });
});
