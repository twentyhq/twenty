import { Readable } from 'stream';
import { Test } from '@nestjs/testing';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { WorkspaceFrontComponentDependenciesService } from 'src/engine/metadata-modules/ai/ai-front-component/workspace-front-component-dependencies.service';
import { logicFunctionCreateHash } from 'src/engine/metadata-modules/logic-function/utils/logic-function-create-hash.utils';

describe('WorkspaceFrontComponentDependenciesService', () => {
  const findApplication = jest.fn();
  const readFile = jest.fn();
  let service: WorkspaceFrontComponentDependenciesService;
  const packageJson = JSON.stringify({
    devDependencies: {
      react: '19.2.0',
      'react-dom': '19.2.0',
      'twenty-ui': '2.50.0',
    },
  });
  const yarnLock = 'locked dependency resolutions';
  beforeEach(async () => {
    jest.clearAllMocks();
    findApplication.mockResolvedValue({
      workspaceCustomFlatApplication: {
        id: 'custom-app',
        universalIdentifier: 'custom-app-universal',
        packageJsonChecksum: logicFunctionCreateHash(packageJson),
        yarnLockChecksum: logicFunctionCreateHash(yarnLock),
      },
    });
    readFile.mockImplementation(
      async ({ resourcePath }: { resourcePath: string }) =>
        Readable.from(resourcePath === 'package.json' ? packageJson : yarnLock),
    );
    const module = await Test.createTestingModule({
      providers: [
        WorkspaceFrontComponentDependenciesService,
        {
          provide: ApplicationService,
          useValue: {
            findWorkspaceTwentyStandardAndCustomApplicationOrThrow:
              findApplication,
          },
        },
        { provide: FileStorageService, useValue: { readFile } },
      ],
    }).compile();
    service = module.get(WorkspaceFrontComponentDependenciesService);
  });
  it('reads the system Workspace app files unchanged, including frontend devDependencies', async () => {
    expect(await service.readOrThrow('workspace')).toMatchObject({
      applicationId: 'custom-app',
      packageJson,
      yarnLock,
    });
    expect(findApplication).toHaveBeenCalledWith({ workspaceId: 'workspace' });
    expect(readFile).toHaveBeenCalledWith(
      expect.objectContaining({
        applicationUniversalIdentifier: 'custom-app-universal',
        workspaceId: 'workspace',
        resourcePath: 'yarn.lock',
      }),
    );
  });
  it('rejects files that no longer match the app metadata', async () => {
    readFile.mockResolvedValue(Readable.from('{}'));
    await expect(service.readOrThrow('workspace')).rejects.toThrow(
      'dependencies changed',
    );
  });
  it('does not fall back to release dependencies when a customized app has no frontend packages', async () => {
    findApplication.mockResolvedValue({
      workspaceCustomFlatApplication: {
        id: 'custom-app',
        universalIdentifier: 'custom-app-universal',
        packageJsonChecksum: logicFunctionCreateHash('{}'),
        yarnLockChecksum: logicFunctionCreateHash(yarnLock),
      },
    });
    readFile.mockImplementation(
      async ({ resourcePath }: { resourcePath: string }) =>
        Readable.from(resourcePath === 'package.json' ? '{}' : yarnLock),
    );
    await expect(service.readOrThrow('workspace')).rejects.toThrow(
      'Add react, react-dom, twenty-ui',
    );
  });
});
