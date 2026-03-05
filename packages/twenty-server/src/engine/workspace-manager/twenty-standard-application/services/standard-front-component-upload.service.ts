import { Injectable, Logger } from '@nestjs/common';

import fs from 'fs';
import path from 'path';

import { FileFolder } from 'twenty-shared/types';
import { STANDARD_FRONT_COMPONENT_BUILD_MANIFEST } from 'twenty-standard-application';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const BUILT_FRONT_COMPONENTS_PATH = path.resolve(
  path.dirname(require.resolve('twenty-standard-application/package.json')),
  'src/build',
);

@Injectable()
export class StandardFrontComponentUploadService {
  private readonly logger = new Logger(
    StandardFrontComponentUploadService.name,
  );

  constructor(private readonly fileStorageService: FileStorageService) {}

  async uploadBuiltFrontComponents({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<void> {
    const applicationUniversalIdentifier =
      TWENTY_STANDARD_APPLICATION.universalIdentifier;

    const manifestEntries = Object.values(
      STANDARD_FRONT_COMPONENT_BUILD_MANIFEST,
    );

    for (const entry of manifestEntries) {
      const localFilePath = path.join(
        BUILT_FRONT_COMPONENTS_PATH,
        entry.builtComponentPath,
      );

      if (!fs.existsSync(localFilePath)) {
        this.logger.warn(
          `Built front component file not found: ${localFilePath}`,
        );

        continue;
      }

      const fileAlreadyExists = await this.fileStorageService.checkFileExists({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.BuiltFrontComponent,
        resourcePath: entry.builtComponentPath,
      });

      if (fileAlreadyExists) {
        continue;
      }

      const fileContent = fs.readFileSync(localFilePath);

      await this.fileStorageService.writeFile({
        sourceFile: fileContent,
        mimeType: 'application/javascript',
        fileFolder: FileFolder.BuiltFrontComponent,
        applicationUniversalIdentifier,
        workspaceId,
        resourcePath: entry.builtComponentPath,
        settings: { isTemporaryFile: false, toDelete: false },
      });
    }
  }
}
