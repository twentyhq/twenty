import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type SetCallRecordingTranscriptValueLoadedOnOpenCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791481209934-set-call-recording-transcript-value-loaded-on-open.command';
import { type UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TRANSCRIPT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.callRecording.fields.transcript.universalIdentifier;
const ORIGINAL_SIBLING_SETTINGS = { legacySetting: 'preserved' };

describe('SetCallRecordingTranscriptValueLoadedOnOpenCommand (integration)', () => {
  let command: SetCallRecordingTranscriptValueLoadedOnOpenCommand;
  let workspaceOrmManager: WorkspaceOrmManager;
  let workspaceCacheService: WorkspaceCacheService;
  let originalTranscript:
    | FieldMetadataEntity<FieldMetadataType.RAW_JSON>
    | undefined;

  const fieldRepository = () =>
    getCoreRepository<FieldMetadataEntity<FieldMetadataType.RAW_JSON>>(
      FieldMetadataEntity,
    );
  const findTranscript = () =>
    fieldRepository().findOneByOrFail({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      universalIdentifier: TRANSCRIPT_UNIVERSAL_IDENTIFIER,
    });
  const refreshCache = () =>
    workspaceCacheService.invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatFieldMetadataMaps',
    ]);
  const setTranscriptSettings = async (settings: Record<string, unknown>) => {
    jestExpectToBeDefined(originalTranscript);
    await fieldRepository().query(
      'UPDATE core."fieldMetadata" SET settings = $1::jsonb WHERE id = $2 AND "workspaceId" = $3',
      [
        JSON.stringify(settings),
        originalTranscript.id,
        SEED_APPLE_WORKSPACE_ID,
      ],
    );
    await refreshCache();
  };
  const runCommand = ({ isDryRun = false }: { isDryRun?: boolean } = {}) =>
    workspaceOrmManager.executeInWorkspaceContext(
      () =>
        command.runOnWorkspace({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          options: { dryRun: isDryRun },
          index: 0,
          total: 1,
        }),
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
    );

  beforeAll(async () => {
    command =
      getAppProviderByClassName<SetCallRecordingTranscriptValueLoadedOnOpenCommand>(
        'SetCallRecordingTranscriptValueLoadedOnOpenCommand',
      );
    const registry = getAppProviderByClassName<UpgradeCommandRegistryService>(
      'UpgradeCommandRegistryService',
    );
    expect(
      registry
        .getBundleForVersion('2.46.0')
        .workspaceCommands.find((entry) => entry.command === command),
    ).toBeDefined();
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    originalTranscript = await findTranscript();
  });

  beforeEach(async () => {
    await setTranscriptSettings(ORIGINAL_SIBLING_SETTINGS);
  });

  afterAll(async () => {
    if (!isDefined(originalTranscript)) {
      return;
    }

    await fieldRepository().update(originalTranscript.id, {
      settings: originalTranscript.settings,
      updatedAt: originalTranscript.updatedAt,
    });
    await refreshCache();
  });

  it('does not change the stored field on a dry run', async () => {
    const beforeUpgrade = await findTranscript();

    await runCommand({ isDryRun: true });

    expect(await findTranscript()).toEqual(beforeUpgrade);
  });

  it('persists the setting and siblings, refreshes the cache, and is idempotent', async () => {
    await runCommand();

    const afterUpgrade = await findTranscript();
    const expectedSettings = {
      ...ORIGINAL_SIBLING_SETTINGS,
      isValueLoadedOnOpen: true,
    };

    expect(afterUpgrade.settings).toEqual(expectedSettings);
    const { flatFieldMetadataMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatFieldMetadataMaps',
      ]);
    expect(
      flatFieldMetadataMaps.byUniversalIdentifier[
        TRANSCRIPT_UNIVERSAL_IDENTIFIER
      ],
    ).toMatchObject({
      settings: expectedSettings,
      universalSettings: expectedSettings,
    });

    await runCommand();

    expect(await findTranscript()).toEqual(afterUpgrade);
  });

  it('preserves an explicit false and sibling settings', async () => {
    await setTranscriptSettings({
      ...ORIGINAL_SIBLING_SETTINGS,
      isValueLoadedOnOpen: false,
    });
    const beforeUpgrade = await findTranscript();

    await runCommand();

    expect(await findTranscript()).toEqual(beforeUpgrade);
    const { flatFieldMetadataMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatFieldMetadataMaps',
      ]);
    expect(
      flatFieldMetadataMaps.byUniversalIdentifier[
        TRANSCRIPT_UNIVERSAL_IDENTIFIER
      ],
    ).toMatchObject({
      settings: beforeUpgrade.settings,
      universalSettings: beforeUpgrade.settings,
    });
  });
});
