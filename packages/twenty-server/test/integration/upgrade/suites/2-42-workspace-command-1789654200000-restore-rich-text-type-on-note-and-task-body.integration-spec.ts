import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { STANDARD_OBJECT_FIELDS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { In } from 'typeorm';

import { type RestoreRichTextTypeOnNoteAndTaskBodyCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789654200000-restore-rich-text-type-on-note-and-task-body.command';
import { invalidateFieldMetadataCache } from 'src/database/commands/upgrade-version-command/utils/invalidate-field-metadata-cache.util';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const authContext = buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID);

const BODY_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECT_FIELDS.note.bodyV2.universalIdentifier,
  STANDARD_OBJECT_FIELDS.task.bodyV2.universalIdentifier,
];

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const listTasksWithBody = (filter?: object) =>
  makeGraphqlAPIRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'task',
      objectMetadataPluralName: 'tasks',
      gqlFields: 'id bodyV2 { markdown }',
      filter,
      first: 1,
    }),
  );

const createTask = () =>
  makeGraphqlAPIRequest(
    createOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: 'id',
      data: { title: 'Task created after the body type was restored' },
    }),
  );

const destroyTask = (taskId: string) =>
  makeGraphqlAPIRequest(
    destroyOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: 'id',
      recordId: taskId,
    }),
  );

describe('2-42 workspace command 1789654200000 - RestoreRichTextTypeOnNoteAndTaskBodyCommand (integration)', () => {
  let command: RestoreRichTextTypeOnNoteAndTaskBodyCommand;
  let workspaceOrmManager: WorkspaceOrmManager;
  let workspaceMigrationRunnerService: WorkspaceMigrationRunnerService;

  const fieldMetadataRepository = () =>
    getCoreRepository<FieldMetadataEntity>(FieldMetadataEntity);

  const bodyFieldScope = {
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    universalIdentifier: In(BODY_FIELD_UNIVERSAL_IDENTIFIERS),
  };

  const findBodyFieldTypes = async () =>
    (await fieldMetadataRepository().find({ where: bodyFieldScope })).map(
      ({ type }) => type,
    );

  const invalidateSeedWorkspaceFieldMetadataCache = () =>
    invalidateFieldMetadataCache({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workspaceMigrationRunnerService,
    });

  // The state a 1.20 upgrade left behind: metadata says TEXT while the columns are still the composite pair.
  const setLegacyState = async () => {
    await fieldMetadataRepository().update(bodyFieldScope, {
      type: FieldMetadataType.TEXT,
    });
    await invalidateSeedWorkspaceFieldMetadataCache();
  };

  const runCommand = (options: { dryRun?: boolean } = {}) =>
    workspaceOrmManager.executeInWorkspaceContext(
      () => command.runOnWorkspace({ ...RUN_ON_WORKSPACE_ARGS, options }),
      authContext,
    );

  beforeAll(() => {
    command =
      getAppProviderByClassName<RestoreRichTextTypeOnNoteAndTaskBodyCommand>(
        'RestoreRichTextTypeOnNoteAndTaskBodyCommand',
      );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
    workspaceMigrationRunnerService =
      getAppProviderByClassName<WorkspaceMigrationRunnerService>(
        'WorkspaceMigrationRunnerService',
      );
  });

  afterAll(async () => {
    await runCommand();
  });

  it('breaks the task body query while the fields are typed TEXT', async () => {
    await setLegacyState();

    expect(await findBodyFieldTypes()).toEqual([
      FieldMetadataType.TEXT,
      FieldMetadataType.TEXT,
    ]);

    const response = await listTasksWithBody();

    expect(response.body.errors).toBeDefined();
  });

  it('leaves the fields untouched on a dry run', async () => {
    await runCommand({ dryRun: true });

    expect(await findBodyFieldTypes()).toEqual([
      FieldMetadataType.TEXT,
      FieldMetadataType.TEXT,
    ]);
  });

  it('restores RICH_TEXT and makes the task body query work again', async () => {
    await runCommand();

    expect(await findBodyFieldTypes()).toEqual([
      FieldMetadataType.RICH_TEXT,
      FieldMetadataType.RICH_TEXT,
    ]);

    const createdTaskId: string = (await createTask()).body.data.createTask.id;

    const response = await listTasksWithBody({ id: { eq: createdTaskId } });

    await destroyTask(createdTaskId);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.tasks.edges).toHaveLength(1);
  });

  it('is a no-op once the fields are already RICH_TEXT', async () => {
    await runCommand();

    expect(await findBodyFieldTypes()).toEqual([
      FieldMetadataType.RICH_TEXT,
      FieldMetadataType.RICH_TEXT,
    ]);
  });
});
