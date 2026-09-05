import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { STANDARD_OBJECT_FIELDS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';
import { In } from 'typeorm';

import { type MakeStandardChildObjectsInheritedCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788593235048-make-standard-child-objects-inherited.command';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const authContext = buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID);

const STANDARD_CHILD_OBJECTS_TO_MAKE_INHERITED = [
  {
    nameSingular: 'attachment',
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.attachment.targetNote.universalIdentifier,
    ],
  },
  {
    nameSingular: 'timelineActivity',
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.timelineActivity.targetPerson.universalIdentifier,
    ],
  },
  {
    nameSingular: 'noteTarget',
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.noteTarget.note.universalIdentifier,
    ],
  },
  {
    nameSingular: 'taskTarget',
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.taskTarget.task.universalIdentifier,
    ],
  },
  {
    nameSingular: 'messageThreadTarget',
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.messageThreadTarget.messageThread
        .universalIdentifier,
    ],
  },
  {
    nameSingular: 'calendarEventTarget',
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.calendarEventTarget.calendarEvent
        .universalIdentifier,
    ],
  },
];

const OBJECT_NAMES_SINGULAR = STANDARD_CHILD_OBJECTS_TO_MAKE_INHERITED.map(
  ({ nameSingular }) => nameSingular,
);

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

type ReadabilityState = {
  readability: MetadataReadability;
  readabilityParentFieldUniversalIdentifiers: string[] | null;
};

const EXPECTED_INHERITED_STATE: Record<string, ReadabilityState> =
  Object.fromEntries(
    STANDARD_CHILD_OBJECTS_TO_MAKE_INHERITED.map(
      ({ nameSingular, readabilityParentFieldUniversalIdentifiers }) => [
        nameSingular,
        {
          readability: MetadataReadability.INHERITED,
          readabilityParentFieldUniversalIdentifiers: [
            ...readabilityParentFieldUniversalIdentifiers,
          ],
        },
      ],
    ),
  );

const EXPECTED_LEGACY_STATE: Record<string, ReadabilityState> =
  Object.fromEntries(
    OBJECT_NAMES_SINGULAR.map((nameSingular) => [
      nameSingular,
      {
        readability: MetadataReadability.OPEN,
        readabilityParentFieldUniversalIdentifiers: null,
      },
    ]),
  );

describe('2-39 workspace command 1788593235048 - MakeStandardChildObjectsInheritedCommand (integration)', () => {
  let command: MakeStandardChildObjectsInheritedCommand;
  let workspaceOrmManager: WorkspaceOrmManager;
  let objectMetadataIds: string[];

  const objectMetadataRepository = () =>
    getCoreRepository<ObjectMetadataEntity>(ObjectMetadataEntity);

  const runCommand = (options: { dryRun?: boolean } = {}) =>
    workspaceOrmManager.executeInWorkspaceContext(
      () => command.runOnWorkspace({ ...RUN_ON_WORKSPACE_ARGS, options }),
      authContext,
    );

  const findReadabilityStates = async (): Promise<
    Record<string, ReadabilityState>
  > => {
    const objectMetadataItems = await objectMetadataRepository().find({
      where: {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        nameSingular: In(OBJECT_NAMES_SINGULAR),
      },
    });

    return Object.fromEntries(
      objectMetadataItems.map((objectMetadata) => [
        objectMetadata.nameSingular,
        {
          readability: objectMetadata.readability,
          readabilityParentFieldUniversalIdentifiers:
            objectMetadata.readabilityParentFieldUniversalIdentifiers,
        },
      ]),
    );
  };

  const setLegacyState = async () => {
    await objectMetadataRepository().update(
      { id: In(objectMetadataIds) },
      {
        readability: MetadataReadability.OPEN,
        readabilityParentFieldUniversalIdentifiers: null,
      },
    );

    for (const objectMetadataId of objectMetadataIds) {
      const { errors } = await updateOneObjectMetadata({
        expectToFail: false,
        input: {
          idToUpdate: objectMetadataId,
          updatePayload: { description: 'readability reset to legacy OPEN' },
        },
      });

      expect(errors).toBeUndefined();
    }
  };

  beforeAll(async () => {
    command =
      getAppProviderByClassName<MakeStandardChildObjectsInheritedCommand>(
        'MakeStandardChildObjectsInheritedCommand',
      );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );

    const objectMetadataItems = await objectMetadataRepository().find({
      where: {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        nameSingular: In(OBJECT_NAMES_SINGULAR),
      },
    });

    expect(objectMetadataItems).toHaveLength(OBJECT_NAMES_SINGULAR.length);

    objectMetadataIds = objectMetadataItems.map(
      (objectMetadata) => objectMetadata.id,
    );

    await setLegacyState();
  });

  afterAll(async () => {
    await runCommand();
  });

  it('leaves the objects OPEN on a dry run', async () => {
    await runCommand({ dryRun: true });

    expect(await findReadabilityStates()).toEqual(EXPECTED_LEGACY_STATE);
  });

  it('makes the six child objects INHERITED with their parent fields and skips them on a second run', async () => {
    await runCommand();
    await runCommand();

    expect(await findReadabilityStates()).toEqual(EXPECTED_INHERITED_STATE);
  });
});
