import { setObjectAccess } from 'test/integration/metadata/suites/object-metadata/utils/set-object-access.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import {
  STANDARD_OBJECT_FIELDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import {
  MetadataReadability,
  type ObjectAccessInheritance,
  ObjectAccessInheritanceMatch,
  ObjectAccessInheritanceRelationKind,
} from 'twenty-shared/types';
import { In } from 'typeorm';

import { type MigrateStandardChildObjectsToInheritedAccessCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789153800002-migrate-standard-child-objects-to-inherited-access.command';
import { STANDARD_CHILD_OBJECT_INHERITANCES } from 'src/database/commands/upgrade-version-command/2-41/standard-child-object-inheritances.constant';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const authContext = buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID);

const OBJECT_NAMES_SINGULAR = STANDARD_CHILD_OBJECT_INHERITANCES.map(
  ({ nameSingular }) => nameSingular,
);

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

type AccessState = {
  readability: MetadataReadability;
  inheritance: ObjectAccessInheritance | null;
};

const EXPECTED_CANONICAL_STATE: Record<string, AccessState> =
  Object.fromEntries(
    STANDARD_CHILD_OBJECT_INHERITANCES.map(({ nameSingular, inheritance }) => [
      nameSingular,
      {
        readability: MetadataReadability.INHERITED,
        inheritance: JSON.parse(
          JSON.stringify(inheritance),
        ) as ObjectAccessInheritance,
      },
    ]),
  );

const EXPECTED_LEGACY_STATE: Record<string, AccessState> = Object.fromEntries(
  OBJECT_NAMES_SINGULAR.map((nameSingular) => [
    nameSingular,
    { readability: MetadataReadability.OPEN, inheritance: null },
  ]),
);

// The pre-`inheritance` declaration named one morph variant field, which the
// command has to lift to the morph group it belongs to
const LEGACY_ATTACHMENT_INHERITANCE: ObjectAccessInheritance = {
  match: ObjectAccessInheritanceMatch.ANY,
  through: [
    {
      kind: ObjectAccessInheritanceRelationKind.FIELD,
      fieldUniversalIdentifier:
        STANDARD_OBJECT_FIELDS.attachment.targetNote.universalIdentifier,
    },
  ],
};

describe('2-41 workspace command 1789153800002 - MigrateStandardChildObjectsToInheritedAccessCommand (integration)', () => {
  let command: MigrateStandardChildObjectsToInheritedAccessCommand;
  let workspaceOrmManager: WorkspaceOrmManager;
  let objectMetadataIds: string[];

  const objectMetadataRepository = () =>
    getCoreRepository<ObjectMetadataEntity>(ObjectMetadataEntity);

  const runCommand = (options: { dryRun?: boolean } = {}) =>
    workspaceOrmManager.executeInWorkspaceContext(
      () => command.runOnWorkspace({ ...RUN_ON_WORKSPACE_ARGS, options }),
      authContext,
    );

  const findAccessStates = async (): Promise<Record<string, AccessState>> => {
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
          inheritance: objectMetadata.inheritance ?? null,
        },
      ]),
    );
  };

  const writeState = async (
    state: {
      readability: MetadataReadability;
      inheritance: ObjectAccessInheritance | null;
    },
    ids: string[] = objectMetadataIds,
  ) => {
    for (const objectMetadataId of ids) {
      await setObjectAccess(objectMetadataId, state);
    }
  };

  beforeAll(async () => {
    command =
      getAppProviderByClassName<MigrateStandardChildObjectsToInheritedAccessCommand>(
        'MigrateStandardChildObjectsToInheritedAccessCommand',
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
  });

  afterAll(async () => {
    await runCommand();
  });

  it('leaves the objects untouched on a dry run', async () => {
    await writeState({
      readability: MetadataReadability.OPEN,
      inheritance: null,
    });

    await runCommand({ dryRun: true });

    expect(await findAccessStates()).toEqual(EXPECTED_LEGACY_STATE);
  });

  it('declares the canonical policy and stays a no-op on a second run', async () => {
    await runCommand();

    const statesAfterFirstRun = await findAccessStates();

    await runCommand();

    expect(statesAfterFirstRun).toEqual(EXPECTED_CANONICAL_STATE);
    expect(await findAccessStates()).toEqual(EXPECTED_CANONICAL_STATE);
  });

  it('lifts a legacy morph variant reference to its morph group', async () => {
    const attachmentObjectMetadata =
      await objectMetadataRepository().findOneOrFail({
        where: {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          nameSingular: 'attachment',
        },
      });

    await writeState(
      {
        readability: MetadataReadability.INHERITED,
        inheritance: LEGACY_ATTACHMENT_INHERITANCE,
      },
      [attachmentObjectMetadata.id],
    );

    await runCommand();

    expect((await findAccessStates()).attachment).toEqual({
      readability: MetadataReadability.INHERITED,
      inheritance: {
        match: ObjectAccessInheritanceMatch.ANY,
        through: [
          {
            kind: ObjectAccessInheritanceRelationKind.MORPH,
            morphId: STANDARD_OBJECTS.attachment.morphIds.targetMorphId.morphId,
          },
        ],
      },
    });
  });
});
