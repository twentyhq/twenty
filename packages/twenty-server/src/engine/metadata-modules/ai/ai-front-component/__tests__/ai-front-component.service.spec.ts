import { type FrontComponentBuildInput } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-build-input.type';
import { createHash } from 'crypto';
import { FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER } from 'twenty-shared/application';
import { PageLayoutType } from 'twenty-shared/types';
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
      async (_workspaceId: string, input: FrontComponentBuildInput) => {
        const compiledSource = `// twenty-ai-shared-dependencies: ${vendorChecksum}\nexport default () => {};`;
        return {
          source: buildFrontComponentEntrySource(input),
          componentName: 'TwentyGeneratedComponent',
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

  it('previews fixtures with the pinned shared bundle, without app files or live reads', async () => {
    const draft = await service.createDraft(INPUT, CONTEXT);
    const preview = await service.getPreview(
      'author',
      draft.draftId,
      AUTH_CONTEXT!,
    );

    expect(dependencies.compiler.build).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({
        source: INPUT.source,
        componentId: expect.any(String),
      }),
    );
    expect(dependencies.compiler.build.mock.calls[0][1]).not.toHaveProperty(
      'sampleRecords',
    );
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
