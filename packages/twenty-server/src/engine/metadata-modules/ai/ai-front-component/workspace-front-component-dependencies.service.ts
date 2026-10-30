import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { computeDependencyFileChecksum } from 'twenty-shared/application';
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
  ) {}

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
      );
    }
    const { dependencies, devDependencies } = packageSchema.parse(
      JSON.parse(packageJson),
    );
    const missingPackages = ['react', 'react-dom', 'twenty-ui'].filter(
      (name) => !isDefined(dependencies?.[name] ?? devDependencies?.[name]),
    );
    if (missingPackages.length > 0) {
      throw new FrontComponentException(
        `Add ${missingPackages.join(', ')} to the Workspace app package.json and yarn.lock before creating a component.`,
        FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
      );
    }
    return {
      applicationId: application.id,
      applicationUniversalIdentifier: application.universalIdentifier,
      packageJson,
      yarnLock,
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
