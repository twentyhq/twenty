import { PageLayoutType } from 'twenty-shared/types';
import { Test } from '@nestjs/testing';
import { Readable } from 'stream';

import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type FrontComponentDraftInput } from '../ai-front-component.schemas';
import { AiFrontComponentService } from '../ai-front-component.service';
import { AiFrontComponentBuildService } from '../ai-front-component-build.service';
import { buildFrontComponentEntrySource } from '../front-component.compiler';

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
    'export default function Component({records}) { return <p>{records.length} renewals</p>; }',
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
    builder: Reflect.construct(AiFrontComponentBuildService, [
      { withLock: async (callback: () => Promise<unknown>) => callback() },
      { tokenBucketThrottleOrThrow: async () => {} },
    ]) as AiFrontComponentBuildService,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    cache.clear();
    componentEntries = [];
    widgetEntries = [];
    commandEntries = [];
    settingsEntries = [];
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

  it('reads live data with current viewer permissions', async () => {
    const viewerContext = {
      ...AUTH_CONTEXT!,
      userWorkspaceId: 'restricted-viewer',
    } as typeof AUTH_CONTEXT;

    const sourceComponentPath =
      'src/ai-front-components/component.front-component.tsx';
    const entrySource = await buildFrontComponentEntrySource({
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
      Readable.from(entrySource.source),
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
