import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatFrontComponentMaps } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component-maps.type';
import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { FrontComponentService } from 'src/engine/metadata-modules/front-component/front-component.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

describe('FrontComponentService', () => {
  let frontComponentService: FrontComponentService;

  const workspaceId = 'workspace-id';
  const frontComponentDatabaseId = 'front-component-database-id';
  const frontComponentUniversalIdentifier =
    'front-component-universal-identifier';

  const mockFlatFrontComponent = {
    id: frontComponentDatabaseId,
    universalIdentifier: frontComponentUniversalIdentifier,
    applicationId: 'application-id',
    applicationUniversalIdentifier: 'application-universal-identifier',
    workspaceId,
    name: 'My Component',
    description: null,
    sourceComponentPath: 'src/index.tsx',
    builtComponentPath: 'dist/index.js',
    componentName: 'MyComponent',
    builtComponentChecksum: 'checksum-123',
    isHeadless: false,
    usesSdkClient: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  } as FlatFrontComponent;

  const mockFlatFrontComponentMaps: FlatFrontComponentMaps = {
    byUniversalIdentifier: {
      [frontComponentUniversalIdentifier]: mockFlatFrontComponent,
    },
    universalIdentifierById: {
      [frontComponentDatabaseId]: frontComponentUniversalIdentifier,
    },
    universalIdentifiersByApplicationId: {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FrontComponentService,
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
              flatFrontComponentMaps: mockFlatFrontComponentMaps,
            }),
          },
        },
        {
          provide: WorkspaceMigrationValidateBuildAndRunService,
          useValue: {
            validateBuildAndRunWorkspaceMigration: jest.fn(),
          },
        },
        {
          provide: ApplicationService,
          useValue: {
            findOneApplicationOrThrow: jest.fn(),
            findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest.fn(),
          },
        },
        {
          provide: FileStorageService,
          useValue: {
            getPresignedUrl: jest.fn(),
            readFile: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    frontComponentService = module.get<FrontComponentService>(
      FrontComponentService,
    );
  });

  it('should be defined', () => {
    expect(frontComponentService).toBeDefined();
  });

  describe('findById', () => {
    it('should return a front component by its database id', async () => {
      const result = await frontComponentService.findById(
        frontComponentDatabaseId,
        workspaceId,
      );

      expect(result?.id).toBe(frontComponentDatabaseId);
    });

    it('should not resolve a universal identifier (id-only lookup)', async () => {
      const result = await frontComponentService.findById(
        frontComponentUniversalIdentifier,
        workspaceId,
      );

      expect(result).toBeNull();
    });

    it('should return null when no front component matches the identifier', async () => {
      const result = await frontComponentService.findById(
        'non-existent-identifier',
        workspaceId,
      );

      expect(result).toBeNull();
    });
  });
});
