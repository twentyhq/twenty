import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { STANDARD_OBJECT_FIELDS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';
import { In } from 'typeorm';

import { type MakeNotesAndTasksInheritTheirTargetsCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789373200002-make-notes-and-tasks-inherit-their-targets.command';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const authContext = buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID);

// Listed here rather than imported from the command: a value import would load
// the command's module graph, which jest cannot resolve in this suite
const STANDARD_OBJECTS_TO_INHERIT_THROUGH_TARGETS = [
  {
    nameSingular: 'note',
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.note.noteTargets.universalIdentifier,
    ],
  },
  {
    nameSingular: 'noteTarget',
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.noteTarget.targetPerson.universalIdentifier,
    ],
  },
  {
    nameSingular: 'task',
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.task.taskTargets.universalIdentifier,
    ],
  },
  {
    nameSingular: 'taskTarget',
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.taskTarget.targetPerson.universalIdentifier,
    ],
  },
];

const OBJECT_NAMES_SINGULAR = STANDARD_OBJECTS_TO_INHERIT_THROUGH_TARGETS.map(
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

const EXPECTED_TARGET_STATE: Record<string, ReadabilityState> =
  Object.fromEntries(
    STANDARD_OBJECTS_TO_INHERIT_THROUGH_TARGETS.map(
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

// The state the previous 2-41 command leaves: targets inherit from their note
// or task, notes and tasks are still OPEN
const LEGACY_STATE: Record<string, ReadabilityState> = {
  note: {
    readability: MetadataReadability.OPEN,
    readabilityParentFieldUniversalIdentifiers: null,
  },
  noteTarget: {
    readability: MetadataReadability.INHERITED,
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.noteTarget.note.universalIdentifier,
    ],
  },
  task: {
    readability: MetadataReadability.OPEN,
    readabilityParentFieldUniversalIdentifiers: null,
  },
  taskTarget: {
    readability: MetadataReadability.INHERITED,
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.taskTarget.task.universalIdentifier,
    ],
  },
};

describe('2-41 workspace command 1789373200002 - MakeNotesAndTasksInheritTheirTargetsCommand (integration)', () => {
  let command: MakeNotesAndTasksInheritTheirTargetsCommand;
  let workspaceOrmManager: WorkspaceOrmManager;
  let objectMetadataIdByNameSingular: Record<string, string>;

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
    for (const [nameSingular, state] of Object.entries(LEGACY_STATE)) {
      const objectMetadataId = objectMetadataIdByNameSingular[nameSingular];

      await objectMetadataRepository().update(objectMetadataId, state);

      const { errors } = await updateOneObjectMetadata({
        expectToFail: false,
        input: {
          idToUpdate: objectMetadataId,
          updatePayload: { description: 'readability reset to legacy state' },
        },
      });

      expect(errors).toBeUndefined();
    }
  };

  beforeAll(async () => {
    command =
      getAppProviderByClassName<MakeNotesAndTasksInheritTheirTargetsCommand>(
        'MakeNotesAndTasksInheritTheirTargetsCommand',
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

    objectMetadataIdByNameSingular = Object.fromEntries(
      objectMetadataItems.map((objectMetadata) => [
        objectMetadata.nameSingular,
        objectMetadata.id,
      ]),
    );

    await setLegacyState();
  });

  afterAll(async () => {
    await runCommand();
  });

  it('leaves the legacy state on a dry run', async () => {
    await runCommand({ dryRun: true });

    expect(await findReadabilityStates()).toEqual(LEGACY_STATE);
  });

  it('makes notes and tasks inherit through their targets and skips them on a second run', async () => {
    await runCommand();
    await runCommand();

    expect(await findReadabilityStates()).toEqual(EXPECTED_TARGET_STATE);
  });
});
