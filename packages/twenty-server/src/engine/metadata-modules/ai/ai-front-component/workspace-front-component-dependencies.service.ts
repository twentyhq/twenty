import { msg } from '@lingui/core/macro';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import {
  computeDependencyFileChecksum,
  FRONT_COMPONENT_SHARED_DEPENDENCIES_BUILT_PATH,
} from 'twenty-shared/application';
import {
  getSharedDependenciesTypeReferencesPath,
  FRONT_COMPONENT_REQUIRED_SHARED_DEPENDENCIES,
  getSharedDependenciesBuildManifestPath,
  type SharedDependenciesBuildManifest,
} from 'twenty-shared/front-component-build';
import { FileFolder } from 'twenty-shared/types';
import { createHash } from 'crypto';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import {
  BUILD_LOCK_MAX_RETRIES,
  BUILD_LOCK_RETRY_MS,
  YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { FRONT_COMPONENT_MAX_BUILD_OUTPUT_BYTES } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-max-build-output-bytes.constant';
import { frontComponentSharedDependenciesManifestSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-shared-dependencies-manifest.schema';
import { convertFrontComponentBuildFailureToException } from 'src/engine/metadata-modules/ai/ai-front-component/utils/convert-front-component-build-failure-to-exception.util';
import { streamToBuffer } from 'src/utils/stream-to-buffer';
import { isDefined } from 'twenty-shared/utils';
import { ApplicationDependencyFilesService } from 'src/engine/core-modules/application/application-package/application-dependency-files.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';

const packageSchema = z.object({
  dependencies: z.record(z.string(), z.string()).optional(),
  devDependencies: z.record(z.string(), z.string()).optional(),
});

@Injectable()
export class WorkspaceFrontComponentDependenciesService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly applicationDependencyFilesService: ApplicationDependencyFilesService,
    private readonly fileStorageService: FileStorageService,
    private readonly cacheLockService: CacheLockService,
    private readonly driverFactory: LogicFunctionDriverFactory,
  ) {}

  async getSharedDependenciesOrThrow(workspaceId: string) {
    return this.cacheLockService.withLock(
      async () => {
        const dependencies = await this.readOrThrow(workspaceId);
        const location = {
          workspaceId,
          applicationUniversalIdentifier:
            dependencies.applicationUniversalIdentifier,
          fileFolder: FileFolder.BuiltFrontComponent,
        };
        const builtPath =
          dependencies.builtPath ??
          FRONT_COMPONENT_SHARED_DEPENDENCIES_BUILT_PATH;
        const existingManifest = await this.readBuildManifest({
          ...location,
          fileFolder: FileFolder.Dependencies,
          resourcePath: getSharedDependenciesBuildManifestPath(builtPath),
        });

        if (
          isDefined(existingManifest) &&
          isDefined(existingManifest.typeReferencesChecksum) &&
          FRONT_COMPONENT_REQUIRED_SHARED_DEPENDENCIES.every((specifier) =>
            isDefined(existingManifest.exports[specifier]),
          ) &&
          existingManifest.checksum === dependencies.builtChecksum &&
          existingManifest.packageJsonChecksum ===
            dependencies.packageJsonChecksum &&
          existingManifest.yarnLockChecksum === dependencies.yarnLockChecksum &&
          (await this.fileStorageService.checkFileExists({
            ...location,
            resourcePath: builtPath,
          })) &&
          (await this.fileStorageService.checkFileExists({
            ...location,
            fileFolder: FileFolder.Dependencies,
            resourcePath: getSharedDependenciesTypeReferencesPath(builtPath),
          }))
        ) {
          const typeReferences = await streamToBuffer(
            await this.fileStorageService.readFile({
              ...location,
              fileFolder: FileFolder.Dependencies,
              resourcePath: getSharedDependenciesTypeReferencesPath(builtPath),
            }),
          );
          if (
            createHash('sha256').update(typeReferences).digest('hex') !==
            existingManifest.typeReferencesChecksum
          ) {
            throw new FrontComponentException(
              'Frontend component type references checksum mismatch.',
              FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED,
            );
          }
          return {
            applicationId: dependencies.applicationId,
            applicationUniversalIdentifier:
              dependencies.applicationUniversalIdentifier,
            typeReferences: typeReferences.toString('base64'),
            ...existingManifest,
            dependencyRevision: dependencies.revision,
          };
        }

        const result = await this.driverFactory
          .getCurrentDriver()
          .buildDependencies({
            workspaceId,
            targetRuntime: 'browser',
            packageJson: dependencies.packageJson,
            yarnLock: dependencies.yarnLock,
          });
        if (!result.success) {
          throw convertFrontComponentBuildFailureToException(result);
        }
        if (
          createHash('sha256').update(result.builtCode).digest('hex') !==
          result.checksum
        ) {
          throw new FrontComponentException(
            'Shared frontend component dependencies checksum mismatch.',
            FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED,
            {
              userFriendlyMessage: msg`The component dependencies could not be verified. Try creating the component again.`,
            },
          );
        }
        if (
          Buffer.byteLength(result.builtCode) >
          FRONT_COMPONENT_MAX_BUILD_OUTPUT_BYTES
        ) {
          throw new FrontComponentException(
            'Shared frontend component dependencies exceed the build output size limit.',
            FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED,
            {
              userFriendlyMessage: msg`The component dependencies are too large. Reduce the Workspace app dependencies and try again.`,
            },
          );
        }
        const currentDependencies = await this.readOrThrow(workspaceId);
        if (
          currentDependencies.revision !== dependencies.revision ||
          currentDependencies.builtChecksum !== dependencies.builtChecksum
        ) {
          throw new FrontComponentException(
            'The Workspace app dependencies changed during the build. Retry creating the component.',
            FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED,
            {
              userFriendlyMessage: msg`The Workspace app dependencies changed during the build. Try creating the component again.`,
            },
          );
        }
        const typeReferences = Buffer.from(result.typeReferences, 'base64');
        const manifest: SharedDependenciesBuildManifest = {
          typeReferencesChecksum: createHash('sha256')
            .update(typeReferences)
            .digest('hex'),
          checksum: result.checksum,
          exports: result.exports,
          packageJsonChecksum: dependencies.packageJsonChecksum,
          yarnLockChecksum: dependencies.yarnLockChecksum,
        };

        await this.fileStorageService.writeFile({
          ...location,
          applicationId: dependencies.applicationId,
          resourcePath: builtPath,
          sourceFile: result.builtCode,
          settings: { isTemporaryFile: false, toDelete: false },
        });
        await this.fileStorageService.writeFile({
          ...location,
          applicationId: dependencies.applicationId,
          fileFolder: FileFolder.Dependencies,
          resourcePath: getSharedDependenciesTypeReferencesPath(builtPath),
          sourceFile: typeReferences,
          settings: { isTemporaryFile: false, toDelete: false },
        });
        await this.fileStorageService.writeFile({
          ...location,
          applicationId: dependencies.applicationId,
          fileFolder: FileFolder.Dependencies,
          resourcePath: getSharedDependenciesBuildManifestPath(builtPath),
          sourceFile: JSON.stringify(manifest),
          settings: { isTemporaryFile: false, toDelete: false },
        });
        await this.applicationService.update(dependencies.applicationId, {
          workspaceId,
          frontComponentSharedDependenciesBuiltPath: builtPath,
          frontComponentSharedDependenciesChecksum: result.checksum,
        });

        if (dependencies.builtChecksum !== result.checksum) {
          await this.applicationService.broadcastFrontComponentSharedDependenciesChecksumUpdates(
            {
              workspaceId,
              applicationId: dependencies.applicationId,
              frontComponentSharedDependenciesChecksum: result.checksum,
            },
          );
        }

        return {
          ...manifest,
          applicationId: dependencies.applicationId,
          applicationUniversalIdentifier:
            dependencies.applicationUniversalIdentifier,
          typeReferences: result.typeReferences,
          dependencyRevision: dependencies.revision,
        };
      },
      `front-component-dependencies:${workspaceId}`,
      {
        ttl: (YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS + 60) * 1000,
        ms: BUILD_LOCK_RETRY_MS,
        maxRetries: BUILD_LOCK_MAX_RETRIES,
      },
    );
  }

  private async readBuildManifest(
    location: Parameters<FileStorageService['readFile']>[0],
  ) {
    try {
      const stream = await this.fileStorageService.readFile(location);
      return frontComponentSharedDependenciesManifestSchema
        .extend({
          typeReferencesChecksum: z.string().optional(),
          packageJsonChecksum: z.string(),
          yarnLockChecksum: z.string().nullable(),
        })
        .parse(JSON.parse((await streamToBuffer(stream)).toString()));
    } catch (error) {
      if (
        error instanceof FileStorageException &&
        error.code === FileStorageExceptionCode.FILE_NOT_FOUND
      ) {
        return undefined;
      }
      throw error;
    }
  }

  async readOrThrow(workspaceId: string) {
    const { workspaceCustomFlatApplication: application } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const {
      packageJsonContent: packageJson,
      yarnLockContent: yarnLock,
      storedFilesChecksums,
    } = await this.applicationDependencyFilesService.getVerifiedDependencyContentsOrThrow(
      {
        workspaceId,
        applicationUniversalIdentifier: application.universalIdentifier,
        declaredChecksums: {
          packageJsonChecksum: application.packageJsonChecksum,
          yarnLockChecksum: application.yarnLockChecksum,
        },
      },
    );

    if (!isDefined(yarnLock)) {
      throw new FrontComponentException(
        'Add yarn.lock to the Workspace app before creating a component.',
        FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
        {
          userFriendlyMessage: msg`Add yarn.lock to the Workspace app before creating a component.`,
        },
      );
    }
    const { dependencies, devDependencies } = packageSchema.parse(
      JSON.parse(packageJson),
    );
    const missingPackages = ['react', 'react-dom', 'twenty-ui'].filter(
      (name) => !isDefined(dependencies?.[name] ?? devDependencies?.[name]),
    );
    if (missingPackages.length > 0) {
      const missingPackageNames = missingPackages.join(', ');

      throw new FrontComponentException(
        `Add ${missingPackageNames} to the Workspace app package.json and yarn.lock before creating a component.`,
        FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
        {
          userFriendlyMessage: msg`Add ${missingPackageNames} to the Workspace app package.json and yarn.lock before creating a component.`,
        },
      );
    }
    return {
      applicationId: application.id,
      applicationUniversalIdentifier: application.universalIdentifier,
      packageJson,
      yarnLock,
      ...storedFilesChecksums,
      builtPath: application.frontComponentSharedDependenciesBuiltPath,
      builtChecksum: application.frontComponentSharedDependenciesChecksum,
      revision: computeDependencyFileChecksum(
        JSON.stringify([
          application.id,
          storedFilesChecksums.packageJsonChecksum,
          storedFilesChecksums.yarnLockChecksum,
        ]),
      ),
    };
  }
}
