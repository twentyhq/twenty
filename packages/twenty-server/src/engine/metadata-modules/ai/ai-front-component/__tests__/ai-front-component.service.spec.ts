import { generateText, stepCountIs } from 'ai';
import { MockLanguageModelV4 } from 'ai/test';
import { readFrontComponentQuery } from 'src/engine/metadata-modules/ai/ai-front-component/utils/read-front-component-query.util';
import { type FrontComponentBuildInput } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-build-input.type';
import { createHash } from 'crypto';
import { FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER } from 'twenty-shared/application';
import { FileFolder, PageLayoutType } from 'twenty-shared/types';
import { Test } from '@nestjs/testing';
import { Readable } from 'stream';

import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type FrontComponentDraftInput } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-draft-input.type';
import { AiFrontComponentService } from 'src/engine/metadata-modules/ai/ai-front-component/ai-front-component.service';
import { buildFrontComponentEntrySource } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-entry-source.util';

jest.mock('src/engine/core-modules/application/application.service', () => ({
  ApplicationService: class {},
}));
jest.mock('src/engine/core-modules/cache-lock/cache-lock.service', () => ({
  CacheLockService: class {},
}));
jest.mock(
  'src/engine/core-modules/feature-flag/services/feature-flag.service',
  () => ({ FeatureFlagService: class {} }),
);
jest.mock(
  'src/engine/core-modules/file-storage/services/file-storage.service',
  () => ({ FileStorageService: class {} }),
);
jest.mock(
  'src/engine/core-modules/record-crud/services/common-api-context-builder.service',
  () => ({ CommonApiContextBuilderService: class {} }),
);
jest.mock(
  'src/engine/core-modules/record-crud/services/find-records.service',
  () => ({ FindRecordsService: class {} }),
);
jest.mock(
  'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service',
  () => ({ WorkspaceManyOrAllFlatEntityMapsCacheService: class {} }),
);
jest.mock(
  'src/engine/metadata-modules/front-component/front-component.service',
  () => ({ FrontComponentService: class {} }),
);
jest.mock(
  'src/engine/metadata-modules/permissions/permissions.service',
  () => ({ PermissionsService: class {} }),
);

jest.useRealTimers();

const WORKSPACE_ID = 'workspace';
const AUTH_CONTEXT = {
  type: 'user',
  workspace: { id: WORKSPACE_ID },
} as ToolProviderContext['authContext'];
const CONTEXT: ToolProviderContext = {
  workspaceId: WORKSPACE_ID,
  userWorkspaceId: 'author',
  threadId: 'thread',
  rolePermissionConfig: {
    intersectionOf: { userWorkspaceRoleId: 'author-role' },
  },
  authContext: AUTH_CONTEXT,
};
const INPUT: FrontComponentDraftInput = {
  pageLayoutType: PageLayoutType.RECORD_PAGE,
  name: 'Renewals',
  source:
    'export function Component({records}) { return <p>{records.length} renewals</p>; }',
  query: { objectName: 'company', select: ['name'], limit: 20 },
  sampleRecords: [{ id: 'sample', name: 'Example' }],
};

const flatMap = (entries: Record<string, unknown>[]) => ({
  byUniversalIdentifier: Object.fromEntries(
    entries.map((entry) => [entry.id, entry]),
  ),
  universalIdentifierById: Object.fromEntries(
    entries.map((entry) => [entry.id, entry.id]),
  ),
});

describe('AI front component lifecycle', () => {
  let service: AiFrontComponentService;
  const cache = new Map<string, unknown>();
  let componentEntries: Record<string, unknown>[];
  let widgetEntries: Record<string, unknown>[];
  let commandEntries: Record<string, unknown>[];
  let settingsEntries: Record<string, unknown>[];
  const dependencies = {
    cache: {
      get: jest.fn(async (key: string) => cache.get(key)),
      set: jest.fn(async (key: string, value: unknown) => {
        cache.set(key, value);
      }),
    },
    locks: { withLock: async (callback: () => Promise<unknown>) => callback() },
    featureFlags: { isFeatureEnabled: jest.fn() },
    permissions: {
      checkRolesPermissions: jest.fn(),
      userHasWorkspaceSettingPermission: jest.fn(),
    },
    applications: {
      findOneApplicationWithRelationsOrThrow: jest.fn(),
      findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest.fn(),
    },
    files: { writeFile: jest.fn(), readFile: jest.fn(), deleteFile: jest.fn() },
    components: {
      createOne: jest.fn(),
      findById: jest.fn(),
      destroyOne: jest.fn(),
    },
    flatMaps: { getOrRecomputeManyOrAllFlatEntityMaps: jest.fn() },
    queryContext: { build: jest.fn() },
    records: { execute: jest.fn() },
    componentRepository: {
      existsBy: jest.fn(async (_workspaceId, { id }) =>
        componentEntries.some((entry) => entry.id === id),
      ),
    },
    compiler: { build: jest.fn() },
    workspaceDependencies: { readOrThrow: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    cache.clear();
    componentEntries = [];
    widgetEntries = [];
    commandEntries = [];
    settingsEntries = [];
    const vendorSource = 'export const vendor = true;';
    const vendorChecksum = createHash('sha256')
      .update(vendorSource)
      .digest('hex');
    dependencies.compiler.build.mockImplementation(
      async ({ input }: { input: FrontComponentBuildInput }) => {
        const compiledSource = `// twenty-ai-shared-dependencies: ${vendorChecksum}\nexport default () => {};`;
        return {
          source: buildFrontComponentEntrySource(input),
          componentName: 'TwentyGeneratedComponent',
          dependencyRevision: 'dependency-revision',
          compiledSource,
          checksum: createHash('sha256').update(compiledSource).digest('hex'),
          sharedDependencies: {
            source: vendorSource,
            checksum: vendorChecksum,
            exportNamesBySpecifier: new Map(),
          },
        };
      },
    );
    dependencies.workspaceDependencies.readOrThrow
      .mockReset()
      .mockResolvedValue({
        revision: 'dependency-revision',
      });
    dependencies.featureFlags.isFeatureEnabled.mockResolvedValue(true);
    dependencies.permissions.checkRolesPermissions.mockResolvedValue(true);
    dependencies.permissions.userHasWorkspaceSettingPermission.mockResolvedValue(
      true,
    );
    dependencies.applications.findWorkspaceTwentyStandardAndCustomApplicationOrThrow.mockResolvedValue(
      {
        workspaceCustomFlatApplication: {
          id: 'application',
          universalIdentifier: 'application-universal',
        },
      },
    );
    dependencies.queryContext.build.mockResolvedValue({
      selectedFields: { id: true, name: true },
    });
    dependencies.records.execute.mockResolvedValue({
      success: true,
      result: {
        records: [{ id: 'live', name: 'Live company' }],
        count: 1,
        hasNextPage: false,
      },
    });
    dependencies.components.createOne.mockImplementation(
      async ({ input }: { input: Record<string, unknown> }) => {
        componentEntries.push({ ...input, applicationId: 'application' });
        return input;
      },
    );
    dependencies.flatMaps.getOrRecomputeManyOrAllFlatEntityMaps.mockImplementation(
      async () => ({
        flatFrontComponentMaps: flatMap(componentEntries),
        flatPageLayoutWidgetMaps: flatMap(widgetEntries),
        flatCommandMenuItemMaps: flatMap(commandEntries),
        flatSettingsMenuItemMaps: flatMap(settingsEntries),
      }),
    );
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: AiFrontComponentService,
          useFactory: () =>
            Reflect.construct(
              AiFrontComponentService,
              Object.values(dependencies),
            ),
        },
      ],
    }).compile();

    service = module.get(AiFrontComponentService);
  });

  const makeReadyDraft = async () => {
    const draft = await service.createDraft(INPUT, CONTEXT);

    await service.recordDiagnostic(WORKSPACE_ID, 'author', draft.draftId, {
      status: 'ready',
    });
    return draft;
  };

  it('offers tools during catalog discovery without a resolved execution context', async () => {
    const tools = await service.generateTools({
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: 'author',
      rolePermissionConfig: CONTEXT.rolePermissionConfig,
    });

    expect(Object.keys(tools)).toContain('preview_front_component');
  });

  it('runs prompt-to-preview through the AI SDK with only the model response scripted', async () => {
    let callCount = 0;
    const model = new MockLanguageModelV4({
      doGenerate: async () => ({
        content:
          ++callCount === 1
            ? [
                {
                  type: 'tool-call',
                  toolCallId: 'preview',
                  toolName: 'preview_front_component',
                  input: JSON.stringify(INPUT),
                },
              ]
            : [{ type: 'text', text: 'Here is your sample preview.' }],
        finishReason: {
          unified: callCount === 1 ? 'tool-calls' : 'stop',
          raw: undefined,
        },
        usage: {
          inputTokens: {
            total: 1,
            noCache: 1,
            cacheRead: undefined,
            cacheWrite: undefined,
          },
          outputTokens: { total: 1, text: 1, reasoning: undefined },
        },
        warnings: [],
      }),
    });
    const result = await generateText({
      model,
      tools: await service.generateTools(CONTEXT),
      prompt: 'Create a renewals widget',
      stopWhen: stepCountIs(2),
    });

    expect(result.text).toBe('Here is your sample preview.');
    expect(result.steps[0].toolResults[0].output).toMatchObject({
      success: true,
      result: {
        draftId: expect.any(String),
        name: INPUT.name,
        sampleRecordCount: INPUT.sampleRecords.length,
      },
    });
    expect(dependencies.records.execute).not.toHaveBeenCalled();
    expect(dependencies.components.createOne).not.toHaveBeenCalled();
  });

  it('previews fixtures with the pinned shared bundle, without app files or live reads', async () => {
    const draft = await service.createDraft(INPUT, CONTEXT);
    expect(
      cache.get(`ai-front-component:${WORKSPACE_ID}:${draft.draftId}`),
    ).toMatchObject({ dependencyRevision: 'dependency-revision' });
    const preview = await service.getPreview(
      'author',
      draft.draftId,
      AUTH_CONTEXT!,
    );

    expect(dependencies.compiler.build).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      input: expect.objectContaining({
        source: INPUT.source,
        componentId: expect.any(String),
      }),
    });
    expect(
      dependencies.compiler.build.mock.calls[0][0].input,
    ).not.toHaveProperty('sampleRecords');
    expect(preview.componentSource).toBe(
      (await dependencies.compiler.build.mock.results[0].value).compiledSource,
    );
    expect(preview.data.records).toEqual(INPUT.sampleRecords);
    expect(preview.componentSource).not.toContain('Example');
    expect(dependencies.records.execute).not.toHaveBeenCalled();
    expect(
      dependencies.flatMaps.getOrRecomputeManyOrAllFlatEntityMaps,
    ).not.toHaveBeenCalled();
    const checksum = preview.componentSource.split('\n', 1)[0].split(': ')[1];
    expect(
      createHash('sha256')
        .update(preview.sharedDependenciesSource!)
        .digest('hex'),
    ).toBe(checksum);
    const secondDraft = await service.createDraft(INPUT, CONTEXT);
    const secondPreview = await service.getPreview(
      'author',
      secondDraft.draftId,
      AUTH_CONTEXT!,
    );
    expect(secondPreview.sharedDependenciesSource).toBe(
      preview.sharedDependenciesSource,
    );
    const vendorEntries = [...cache.keys()].filter((key) =>
      key.startsWith('ai-front-component-shared-dependencies:'),
    );
    expect(vendorEntries).toHaveLength(1);
    cache.delete(vendorEntries[0]);
    await expect(
      service.getPreview('author', draft.draftId, AUTH_CONTEXT!),
    ).rejects.toThrow('dependencies are missing or expired');
    expect(dependencies.files.writeFile).not.toHaveBeenCalled();
    expect(dependencies.components.createOne).not.toHaveBeenCalled();
  });
  it('does not provision a build when the feature is disabled', async () => {
    dependencies.featureFlags.isFeatureEnabled.mockResolvedValue(false);
    await expect(service.createDraft(INPUT, CONTEXT)).rejects.toThrow(
      'disabled',
    );
    expect(dependencies.compiler.build).not.toHaveBeenCalled();
  });

  it('does not cache or save a draft when Lambda compilation fails', async () => {
    dependencies.compiler.build.mockRejectedValueOnce(
      new Error('Lambda build unavailable'),
    );
    await expect(service.createDraft(INPUT, CONTEXT)).rejects.toThrow(
      'Lambda build unavailable',
    );
    expect(cache.size).toBe(0);
    expect(dependencies.files.writeFile).not.toHaveBeenCalled();
    expect(dependencies.components.createOne).not.toHaveBeenCalled();
  });

  it.each(['inline', 'application', 'pinned'] as const)(
    'loads %s components with their own shared dependencies',
    async (kind) => {
      const sharedDependenciesSource = 'export const dependency = true;';
      const checksum = createHash('sha256')
        .update(sharedDependenciesSource)
        .digest('hex');
      const componentSource =
        (kind === 'pinned'
          ? `// twenty-ai-shared-dependencies: ${checksum}\n`
          : '') +
        (kind === 'inline'
          ? 'export default () => {};'
          : `import '${FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER}';`);
      const vendorPath =
        kind === 'pinned'
          ? `ai-front-component-shared-dependencies/${checksum}.mjs`
          : 'app-vendor.mjs';
      jest
        .spyOn(service, 'getRecords')
        .mockResolvedValue({ records: [], count: 0, hasNextPage: false });
      dependencies.components.findById.mockResolvedValue({
        sourceComponentPath:
          'src/ai-front-components/component.front-component.tsx',
        builtComponentPath: 'component.mjs',
        builtComponentChecksum: createHash('sha256')
          .update(componentSource)
          .digest('hex'),
      });
      dependencies.applications.findOneApplicationWithRelationsOrThrow.mockResolvedValue(
        {
          frontComponentSharedDependenciesBuiltPath: 'app-vendor.mjs',
          frontComponentSharedDependenciesChecksum: checksum,
        },
      );
      dependencies.files.readFile.mockImplementation(
        async ({ resourcePath }) => {
          if (resourcePath === 'component.mjs')
            return Readable.from(componentSource);
          if (resourcePath === vendorPath)
            return Readable.from(sharedDependenciesSource);
          throw new Error('Unexpected file: ' + resourcePath);
        },
      );
      const runtime = await service.getRuntime('component', AUTH_CONTEXT!);
      expect(runtime.sharedDependenciesSource).toBe(
        kind === 'application' ? sharedDependenciesSource : undefined,
      );
      expect(
        dependencies.applications.findOneApplicationWithRelationsOrThrow,
      ).toHaveBeenCalledTimes(kind === 'application' ? 1 : 0);
      expect(runtime.sharedDependenciesChecksum).toBe(
        kind === 'pinned' ? checksum : undefined,
      );
      if (kind === 'pinned') {
        expect(dependencies.files.readFile).toHaveBeenCalledTimes(1);
        await expect(
          service.getSharedDependencies(checksum + '.js', AUTH_CONTEXT!),
        ).resolves.toBe(sharedDependenciesSource);
      }
      if (kind !== 'inline') {
        dependencies.files.readFile.mockImplementation(
          async ({ resourcePath }) =>
            Readable.from(
              resourcePath === 'component.mjs'
                ? componentSource
                : 'changed vendor',
            ),
        );
        await expect(
          kind === 'pinned'
            ? service.getSharedDependencies(checksum + '.js', AUTH_CONTEXT!)
            : service.getRuntime('component', AUTH_CONTEXT!),
        ).rejects.toThrow('shared dependencies checksum mismatch');
      }
      dependencies.files.readFile.mockResolvedValue(
        Readable.from('changed component'),
      );
      await expect(
        service.getRuntime('component', AUTH_CONTEXT!),
      ).rejects.toThrow('Component source checksum mismatch');
    },
  );

  it('keeps the last working draft after a build error and supersedes it after a successful revision', async () => {
    const first = await makeReadyDraft();

    dependencies.compiler.build.mockRejectedValueOnce(new Error('Invalid TSX'));

    await expect(
      service.createDraft(
        {
          ...INPUT,
          previousDraftId: first.draftId,
          source: 'export default <',
        },
        CONTEXT,
      ),
    ).rejects.toThrow();
    expect(
      (await service.getPreview('author', first.draftId, AUTH_CONTEXT!))
        .isCurrent,
    ).toBe(true);
    const second = await service.createDraft(
      { ...INPUT, previousDraftId: first.draftId, name: 'Revised renewals' },
      CONTEXT,
    );

    expect(second.draftId).not.toBe(first.draftId);
    expect(
      (await service.getPreview('author', first.draftId, AUTH_CONTEXT!))
        .isCurrent,
    ).toBe(false);
    await expect(
      service.publish(first.draftId, {
        ...CONTEXT,
        approvedToolName: 'publish_front_component',
      }),
    ).rejects.toThrow('superseded');
  });

  it('requires explicit approval of this tool, working preview and original chat', async () => {
    const draft = await service.createDraft(INPUT, CONTEXT);

    await expect(service.publish(draft.draftId, CONTEXT)).rejects.toThrow(
      'human approval',
    );
    await expect(
      service.publish(draft.draftId, {
        ...CONTEXT,
        approvedToolName: 'execute_tool',
      }),
    ).rejects.toThrow('human approval');
    await expect(
      service.publish(draft.draftId, {
        ...CONTEXT,
        approvedToolName: 'publish_front_component',
      }),
    ).rejects.toThrow('working preview');
    await service.recordDiagnostic(WORKSPACE_ID, 'author', draft.draftId, {
      status: 'error',
      message: 'Broken JSX',
    });
    await expect(
      service.publish(draft.draftId, {
        ...CONTEXT,
        approvedToolName: 'publish_front_component',
      }),
    ).rejects.toThrow('working preview');
    await expect(
      service.publish(draft.draftId, {
        ...CONTEXT,
        threadId: 'other',
        approvedToolName: 'publish_front_component',
      }),
    ).rejects.toThrow('original chat');
    expect(dependencies.files.writeFile).not.toHaveBeenCalled();
  });

  it('rejects another author, another workspace, expired drafts and lost permissions', async () => {
    const draft = await makeReadyDraft();

    await expect(
      service.getPreview('other', draft.draftId, AUTH_CONTEXT!),
    ).rejects.toThrow('not found');
    await expect(
      service.getPreview('author', draft.draftId, {
        ...AUTH_CONTEXT!,
        workspace: { ...AUTH_CONTEXT!.workspace, id: 'other' },
      }),
    ).rejects.toThrow('not found');
    dependencies.permissions.userHasWorkspaceSettingPermission.mockResolvedValue(
      false,
    );
    await expect(
      service.publish(draft.draftId, {
        ...CONTEXT,
        approvedToolName: 'publish_front_component',
      }),
    ).rejects.toThrow('applications');
    dependencies.permissions.userHasWorkspaceSettingPermission.mockResolvedValue(
      true,
    );
    cache.clear();
    await expect(
      service.getPreview('author', draft.draftId, AUTH_CONTEXT!),
    ).rejects.toThrow('expired');
  });

  it('gates both tool discovery and saved-component reads', async () => {
    dependencies.featureFlags.isFeatureEnabled.mockResolvedValue(false);

    expect(await service.generateTools(CONTEXT)).toEqual({});
    await expect(
      service.getRecords('component', AUTH_CONTEXT!),
    ).rejects.toThrow('disabled');
    expect(dependencies.files.readFile).not.toHaveBeenCalled();
  });

  it('requires application permission for discovery and authoring', async () => {
    dependencies.permissions.checkRolesPermissions.mockResolvedValue(false);
    dependencies.permissions.userHasWorkspaceSettingPermission.mockResolvedValue(
      false,
    );
    expect(await service.generateTools(CONTEXT)).toEqual({});
    await expect(service.createDraft(INPUT, CONTEXT)).rejects.toThrow(
      'applications',
    );
    expect(dependencies.files.writeFile).not.toHaveBeenCalled();
  });

  it('saves a reusable component without layout permissions', async () => {
    dependencies.permissions.checkRolesPermissions.mockImplementation(
      async (_role, _workspace, permission) => permission === 'APPLICATIONS',
    );
    dependencies.permissions.userHasWorkspaceSettingPermission.mockImplementation(
      async ({ setting }) => setting === 'APPLICATIONS',
    );
    expect(Object.keys(await service.generateTools(CONTEXT))).toContain(
      'preview_front_component',
    );
    const draft = await makeReadyDraft();
    await service.publish(draft.draftId, {
      ...CONTEXT,
      approvedToolName: 'publish_front_component',
    });
    expect(dependencies.components.createOne).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: WORKSPACE_ID,
        input: expect.objectContaining({
          id: draft.draftId,
          universalWidgetAvailability: [
            { pageLayoutType: INPUT.pageLayoutType },
          ],
        }),
      }),
    );
    expect(
      dependencies.flatMaps.getOrRecomputeManyOrAllFlatEntityMaps,
    ).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      flatMapsKeys: ['flatFrontComponentMaps'],
    });
    const sourceFiles = dependencies.files.writeFile.mock.calls
      .map(([file]) => file)
      .filter(({ fileFolder }) => fileFolder === FileFolder.Source);
    expect(sourceFiles).toHaveLength(1);
    expect(sourceFiles[0].resourcePath).toBe(
      `src/ai-front-components/${draft.draftId}.front-component.tsx`,
    );
    expect(sourceFiles[0].sourceFile).toContain('renewals');
    expect(readFrontComponentQuery(sourceFiles[0].sourceFile)).toEqual(
      INPUT.query,
    );
    expect(sourceFiles[0].sourceFile).not.toContain('Example');
  });

  it('blocks approval after the feature flag is disabled', async () => {
    const draft = await makeReadyDraft();

    dependencies.featureFlags.isFeatureEnabled.mockResolvedValue(false);
    await expect(
      service.publish(draft.draftId, {
        ...CONTEXT,
        approvedToolName: 'publish_front_component',
      }),
    ).rejects.toThrow('disabled');
    expect(dependencies.files.writeFile).not.toHaveBeenCalled();
  });

  it('requires a new preview after app dependencies change and allows revision', async () => {
    const draft = await makeReadyDraft();

    dependencies.workspaceDependencies.readOrThrow.mockResolvedValue({
      revision: 'changed-dependency-revision',
    });
    await expect(
      service.publish(draft.draftId, {
        ...CONTEXT,
        approvedToolName: 'publish_front_component',
      }),
    ).rejects.toThrow('Create and approve a new preview');
    expect(dependencies.files.writeFile).not.toHaveBeenCalled();
    expect(dependencies.components.createOne).not.toHaveBeenCalled();
    await expect(
      service.createDraft(
        { ...INPUT, previousDraftId: draft.draftId },
        CONTEXT,
      ),
    ).resolves.toHaveProperty('draftId');
  });

  it('recovers a lost registration response without duplicating the component', async () => {
    const draft = await makeReadyDraft();
    const approvedContext = {
      ...CONTEXT,
      approvedToolName: 'publish_front_component',
    };

    dependencies.components.createOne.mockImplementationOnce(
      async ({ input }) => {
        componentEntries.push({ ...input, applicationId: 'application' });
        throw new Error('Lost registration response');
      },
    );
    await expect(
      service.publish(draft.draftId, approvedContext),
    ).rejects.toThrow('Lost registration response');
    dependencies.workspaceDependencies.readOrThrow.mockRejectedValue(
      new Error('Dependencies changed after publication'),
    );
    const result = await service.publish(draft.draftId, approvedContext);
    const repeated = await service.publish(draft.draftId, approvedContext);

    expect(result).toEqual(repeated);
    expect(result).toMatchObject({
      frontComponentId: draft.draftId,
      applicationId: 'application',
    });
    expect(dependencies.components.createOne).toHaveBeenCalledTimes(1);
    expect(dependencies.files.writeFile).toHaveBeenCalledTimes(3);
    expect(dependencies.files.deleteFile).not.toHaveBeenCalled();
    for (const [file] of dependencies.files.writeFile.mock.calls) {
      expect(file.sourceFile).not.toContain('Example');
    }
  });

  it.each(['vendor', 'source', 'bundle', 'registration'])(
    'cleans up a failed %s save and allows retry',
    async (failure) => {
      const draft = await makeReadyDraft();
      const approvedContext = {
        ...CONTEXT,
        approvedToolName: 'publish_front_component',
      };
      if (failure !== 'vendor')
        dependencies.files.writeFile.mockResolvedValueOnce(undefined);
      if (failure === 'registration') {
        dependencies.components.createOne.mockRejectedValueOnce(
          new Error('Registration failed'),
        );
      } else {
        if (failure === 'bundle') {
          dependencies.files.writeFile.mockResolvedValueOnce(undefined);
        }
        dependencies.files.writeFile.mockRejectedValueOnce(
          new Error('Storage failed'),
        );
      }
      await expect(
        service.publish(draft.draftId, approvedContext),
      ).rejects.toThrow('failed');
      expect(dependencies.files.deleteFile).toHaveBeenCalledTimes(2);
      for (const [file] of dependencies.files.deleteFile.mock.calls) {
        expect(file.resourcePath).not.toContain(
          'ai-front-component-shared-dependencies/',
        );
      }
      expect(componentEntries).toHaveLength(0);
      await expect(
        service.publish(draft.draftId, approvedContext),
      ).resolves.toMatchObject({ frontComponentId: draft.draftId });
      expect(componentEntries).toHaveLength(1);
    },
  );

  it('publishes the exact component and vendor shown in the preview for one surface', async () => {
    const draft = await makeReadyDraft();
    const preview = await service.getPreview(
      'author',
      draft.draftId,
      AUTH_CONTEXT!,
    );
    await service.publish(draft.draftId, {
      ...CONTEXT,
      approvedToolName: 'publish_front_component',
    });
    expect(dependencies.files.writeFile).toHaveBeenCalledWith(
      expect.objectContaining({
        fileFolder: FileFolder.BuiltFrontComponent,
        sourceFile: preview.componentSource,
      }),
    );
    expect(dependencies.files.writeFile).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        resourcePath: `ai-front-component-shared-dependencies/${createHash('sha256').update(preview.sharedDependenciesSource!).digest('hex')}.mjs`,
        sourceFile: preview.sharedDependenciesSource,
      }),
    );
    expect(dependencies.components.createOne).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          universalWidgetAvailability: [
            { pageLayoutType: INPUT.pageLayoutType },
          ],
        }),
      }),
    );
  });

  it('rejects invalid asset paths and disabled workspaces before reading files', async () => {
    await expect(
      service.getSharedDependencies('../other.js', AUTH_CONTEXT!),
    ).rejects.toThrow('Invalid component');
    dependencies.featureFlags.isFeatureEnabled.mockResolvedValue(false);
    await expect(
      service.getSharedDependencies('a'.repeat(64) + '.js', AUTH_CONTEXT!),
    ).rejects.toThrow('disabled');
    expect(dependencies.files.readFile).not.toHaveBeenCalled();
  });

  it('reads live data with current viewer permissions', async () => {
    const viewerContext = {
      ...AUTH_CONTEXT!,
      userWorkspaceId: 'restricted-viewer',
    } as typeof AUTH_CONTEXT;

    const sourceComponentPath =
      'src/ai-front-components/component.front-component.tsx';
    const entrySource = buildFrontComponentEntrySource({
      componentId: 'component',
      name: INPUT.name,
      source: INPUT.source,
      query: INPUT.query,
      pageLayoutType: INPUT.pageLayoutType,
    });
    dependencies.components.findById.mockResolvedValue({
      applicationId: 'application',
      sourceComponentPath,
    });
    dependencies.files.readFile.mockImplementation(async () =>
      Readable.from(entrySource),
    );
    await service.getRecords('component', viewerContext!);
    expect(dependencies.files.readFile).toHaveBeenCalledWith(
      expect.objectContaining({
        resourcePath: sourceComponentPath,
      }),
    );
    expect(dependencies.records.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        authContext: viewerContext,
        shouldBuildEffectiveSelectFields: true,
        limit: 20,
      }),
    );
    dependencies.records.execute.mockClear();
    dependencies.queryContext.build.mockResolvedValue({
      selectedFields: { id: true },
    });
    await expect(
      service.getRecords('component', viewerContext!),
    ).rejects.toThrow('unavailable');
    expect(dependencies.records.execute).not.toHaveBeenCalled();
  });
});
