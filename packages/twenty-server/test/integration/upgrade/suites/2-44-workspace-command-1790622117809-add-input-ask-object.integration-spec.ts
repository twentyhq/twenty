import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability, MetadataWritability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AddInputAskObjectCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790622117809-add-input-ask-object.command';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const INVERSE_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.workflowRun.fields.inputAsks.universalIdentifier,
  STANDARD_OBJECTS.workspaceMember.fields.inputAsks.universalIdentifier,
  STANDARD_OBJECTS.agentChatThread.fields.inputAsks.universalIdentifier,
];

describe('2-44 workspace command 1790622117809 - AddInputAskObjectCommand (integration)', () => {
  let command: AddInputAskObjectCommand;
  let workspaceOrmManager: WorkspaceOrmManager;
  let workspaceCacheService: WorkspaceCacheService;

  const runInWorkspace = (run: () => Promise<void>) =>
    workspaceOrmManager.executeInWorkspaceContext(
      run,
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
    );

  const readState = async () => {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      flatViewMaps,
    } = await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'flatViewMaps',
    ]);
    const inputAskObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.inputAsk.universalIdentifier
      ];

    return {
      hasObject: isDefined(inputAskObject),
      readability: inputAskObject?.readability,
      readabilityParentFieldUniversalIdentifiers:
        inputAskObject?.readabilityParentFieldUniversalIdentifiers,
      writability: inputAskObject?.writability,
      fieldCount: Object.values(STANDARD_OBJECTS.inputAsk.fields).filter(
        ({ universalIdentifier }) =>
          isDefined(
            flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier],
          ),
      ).length,
      inverseFieldCount: INVERSE_FIELD_UNIVERSAL_IDENTIFIERS.filter(
        (universalIdentifier) =>
          isDefined(
            flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier],
          ),
      ).length,
      indexCount: Object.values(STANDARD_OBJECTS.inputAsk.indexes).filter(
        ({ universalIdentifier }) =>
          isDefined(flatIndexMaps.byUniversalIdentifier[universalIdentifier]),
      ).length,
      viewCount: Object.values(STANDARD_OBJECTS.inputAsk.views).filter(
        ({ universalIdentifier }) =>
          isDefined(flatViewMaps.byUniversalIdentifier[universalIdentifier]),
      ).length,
    };
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<AddInputAskObjectCommand>(
      'AddInputAskObjectCommand',
    );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );

    // What a workspace looks like before the command: no Ask object at all.
    await runInWorkspace(() => command.down(RUN_ON_WORKSPACE_ARGS));
  });

  afterAll(async () => {
    await runInWorkspace(() => command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS));
  });

  it('starts from a workspace without the Ask object or its inverse fields', async () => {
    expect(await readState()).toMatchObject({
      hasObject: false,
      fieldCount: 0,
      inverseFieldCount: 0,
    });
  });

  it('changes nothing on a dry run', async () => {
    await runInWorkspace(() =>
      command.runOnWorkspace({
        ...RUN_ON_WORKSPACE_ARGS,
        options: { dryRun: true },
      }),
    );

    expect(await readState()).toMatchObject({ hasObject: false });
  });

  it('creates the object as a fresh install has it', async () => {
    await runInWorkspace(() => command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS));

    expect(await readState()).toEqual({
      hasObject: true,
      readability: MetadataReadability.INHERITED,
      readabilityParentFieldUniversalIdentifiers: [
        STANDARD_OBJECTS.inputAsk.fields.workflowRun.universalIdentifier,
        STANDARD_OBJECTS.inputAsk.fields.thread.universalIdentifier,
      ],
      writability: MetadataWritability.SYSTEM,
      fieldCount: Object.keys(STANDARD_OBJECTS.inputAsk.fields).length,
      inverseFieldCount: INVERSE_FIELD_UNIVERSAL_IDENTIFIERS.length,
      indexCount: Object.keys(STANDARD_OBJECTS.inputAsk.indexes).length,
      viewCount: Object.keys(STANDARD_OBJECTS.inputAsk.views).length,
    });
  });

  it('is a no-op when run again', async () => {
    const before = await readState();

    await runInWorkspace(() => command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS));

    expect(await readState()).toEqual(before);
  });

  it('removes the object and its inverse fields on down', async () => {
    await runInWorkspace(() => command.down(RUN_ON_WORKSPACE_ARGS));

    expect(await readState()).toMatchObject({
      hasObject: false,
      fieldCount: 0,
      inverseFieldCount: 0,
    });
  });
});
