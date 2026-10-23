import { Injectable } from '@nestjs/common';
import { text } from 'stream/consumers';
import { z } from 'zod';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { logicFunctionCreateHash } from 'src/engine/metadata-modules/logic-function/utils/logic-function-create-hash.utils';
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
    private readonly fileStorageService: FileStorageService,
  ) {}

  async readOrThrow(workspaceId: string) {
    const { workspaceCustomFlatApplication: application } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const [packageJson, yarnLock] = await Promise.all(
      ['package.json', 'yarn.lock'].map(async (resourcePath) =>
        text(
          await this.fileStorageService.readFile({
            workspaceId,
            applicationUniversalIdentifier: application.universalIdentifier,
            fileFolder: FileFolder.Dependencies,
            resourcePath,
          }),
        ),
      ),
    );
    const packageContents = JSON.parse(packageJson);
    const packageJsonChecksum = logicFunctionCreateHash(
      JSON.stringify(packageContents),
    );
    const yarnLockChecksum = logicFunctionCreateHash(yarnLock);
    if (
      packageJsonChecksum !== application.packageJsonChecksum ||
      yarnLockChecksum !== application.yarnLockChecksum
    ) {
      throw new FrontComponentException(
        'Workspace app dependencies changed while reading. Retry the preview.',
        FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
      );
    }
    const { dependencies, devDependencies } =
      packageSchema.parse(packageContents);
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
      packageJson,
      yarnLock,
      revision: logicFunctionCreateHash(
        JSON.stringify([application.id, packageJsonChecksum, yarnLockChecksum]),
      ),
    };
  }
}
