import { Readable } from 'stream';

import { FileFolder } from 'twenty-shared/types';

import { ApplicationDependencyFilesService } from 'src/engine/core-modules/application/application-package/application-dependency-files.service';
import { type DependencyChecksums } from 'src/engine/core-modules/application/application-package/utils/assert-matching-dependency-checksums-or-throw.util';
import { computeApplicationPackageChecksums } from 'src/engine/core-modules/application/application-package/utils/compute-application-package-checksums.util';
import { computeLegacyApplicationPackageChecksums } from 'src/engine/core-modules/application/application-package/utils/compute-legacy-application-package-checksums.util';
import { ApplicationException } from 'src/engine/core-modules/application/application.exception';
import { WorkspaceFrontComponentDependenciesService } from 'src/engine/metadata-modules/ai/ai-front-component/workspace-front-component-dependencies.service';
import { FrontComponentException } from 'src/engine/metadata-modules/front-component/front-component.exception';

const WORKSPACE_ID = 'workspace-id';
const APPLICATION_ID = 'workspace-app-id';
const APPLICATION_UNIVERSAL_IDENTIFIER = 'workspace-app-universal-identifier';
const FRONTEND_PACKAGES = {
  react: '19.2.0',
  'react-dom': '19.2.0',
  'twenty-ui': '~2.51.0',
};
const PACKAGE_JSON = JSON.stringify(
  { devDependencies: FRONTEND_PACKAGES },
  null,
  2,
);
const YARN_LOCK = '# yarn lockfile\n';

const buildService = ({
  packageJsonContent = PACKAGE_JSON,
  yarnLockContent = YARN_LOCK,
  declaredChecksums = computeApplicationPackageChecksums({
    packageJsonContent,
    yarnLockContent,
  }),
}: {
  packageJsonContent?: string;
  yarnLockContent?: string | null;
  declaredChecksums?: DependencyChecksums;
} = {}) => {
  const applicationService = {
    findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
      .fn()
      .mockResolvedValue({
        workspaceCustomFlatApplication: {
          id: APPLICATION_ID,
          universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          ...declaredChecksums,
        },
      }),
  };
  const fileStorageService = {
    checkFileExists: jest.fn().mockResolvedValue(yarnLockContent !== null),
    readFile: jest
      .fn()
      .mockImplementation(({ resourcePath }: { resourcePath: string }) =>
        Promise.resolve(
          Readable.from([
            Buffer.from(
              resourcePath === 'package.json'
                ? packageJsonContent
                : (yarnLockContent ?? ''),
            ),
          ]),
        ),
      ),
  };
  const service = new WorkspaceFrontComponentDependenciesService(
    applicationService as never,
    new ApplicationDependencyFilesService(fileStorageService as never),
  );

  return { service, fileStorageService };
};

describe('WorkspaceFrontComponentDependenciesService', () => {
  it('reads the selected Workspace app and preserves the stored dependency bytes', async () => {
    const { service, fileStorageService } = buildService();

    await expect(service.readOrThrow(WORKSPACE_ID)).resolves.toMatchObject({
      applicationId: APPLICATION_ID,
      packageJson: PACKAGE_JSON,
      yarnLock: YARN_LOCK,
    });
    for (const resourcePath of ['package.json', 'yarn.lock']) {
      expect(fileStorageService.readFile).toHaveBeenCalledWith({
        workspaceId: WORKSPACE_ID,
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        fileFolder: FileFolder.Dependencies,
        resourcePath,
      });
    }
  });

  it('accepts legacy checksums without changing the dependency revision', async () => {
    const current = buildService();
    const legacy = buildService({
      declaredChecksums: computeLegacyApplicationPackageChecksums({
        packageJsonContent: PACKAGE_JSON,
        yarnLockContent: YARN_LOCK,
      }),
    });

    expect(await legacy.service.readOrThrow(WORKSPACE_ID)).toEqual(
      await current.service.readOrThrow(WORKSPACE_ID),
    );
  });

  it('changes the revision when verified lockfile contents change', async () => {
    const original = buildService();
    const updated = buildService({
      yarnLockContent: `${YARN_LOCK}# updated\n`,
    });

    const originalDependencies =
      await original.service.readOrThrow(WORKSPACE_ID);
    const updatedDependencies = await updated.service.readOrThrow(WORKSPACE_ID);

    expect(updatedDependencies.revision).not.toEqual(
      originalDependencies.revision,
    );
  });

  it.each(['packageJsonChecksum', 'yarnLockChecksum'])(
    'rejects files with a mismatched %s',
    async (checksum) => {
      const { service } = buildService({
        declaredChecksums: {
          ...computeApplicationPackageChecksums({
            packageJsonContent: PACKAGE_JSON,
            yarnLockContent: YARN_LOCK,
          }),
          [checksum]: 'stale-checksum',
        },
      });

      await expect(service.readOrThrow(WORKSPACE_ID)).rejects.toThrow(
        ApplicationException,
      );
    },
  );

  it('requires a lockfile even when shared verification accepts its absence', async () => {
    const { service } = buildService({ yarnLockContent: null });

    await expect(service.readOrThrow(WORKSPACE_ID)).rejects.toThrow(
      'Add yarn.lock to the Workspace app before creating a component.',
    );
  });

  it('accepts frontend packages declared as production dependencies', async () => {
    const packageJsonContent = JSON.stringify({
      dependencies: FRONTEND_PACKAGES,
    });
    const { service } = buildService({ packageJsonContent });

    await expect(service.readOrThrow(WORKSPACE_ID)).resolves.toMatchObject({
      packageJson: packageJsonContent,
    });
  });

  it.each(['react', 'react-dom', 'twenty-ui'])(
    'still requires %s in the app manifest',
    async (missingPackage) => {
      const { service } = buildService({
        packageJsonContent: JSON.stringify({
          devDependencies: Object.fromEntries(
            Object.entries(FRONTEND_PACKAGES).filter(
              ([name]) => name !== missingPackage,
            ),
          ),
        }),
      });

      await expect(service.readOrThrow(WORKSPACE_ID)).rejects.toThrow(
        FrontComponentException,
      );
    },
  );
});
