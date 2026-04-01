import crypto from 'crypto';

import { Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FrontComponentService } from 'src/engine/metadata-modules/front-component/front-component.service';
import {
  type FrontComponentSeedProjectFile,
  getFrontComponentSeedProjectFiles,
} from 'src/engine/metadata-modules/front-component/utils/get-front-component-seed-project-files.util';
import { type SeedFrontComponentDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/utils/prefill-front-component-definitions.util';

@Injectable()
export class PrefillFrontComponentService {
  constructor(
    private readonly frontComponentService: FrontComponentService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly fileStorageService: FileStorageService,
    private readonly applicationService: ApplicationService,
  ) {}

  async ensureSeeded({
    workspaceId,
    definitions,
  }: {
    workspaceId: string;
    definitions: SeedFrontComponentDefinition[];
  }) {
    const { flatFrontComponentMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFrontComponentMaps'],
        },
      );

    const { workspaceCustomFlatApplication: ownerFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    for (const definition of definitions) {
      const existingFrontComponent = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: definition.id,
        flatEntityMaps: flatFrontComponentMaps,
      });

      if (isDefined(existingFrontComponent)) {
        continue;
      }

      const seedFiles = await getFrontComponentSeedProjectFiles(
        definition.seedProjectSubdir,
      );

      const sourceFile = seedFiles.find((file: FrontComponentSeedProjectFile) =>
        file.name.endsWith('index.tsx'),
      );

      const builtFile = seedFiles.find((file: FrontComponentSeedProjectFile) =>
        file.name.endsWith('index.mjs'),
      );

      if (!isDefined(sourceFile) || !isDefined(builtFile)) {
        throw new Error(
          `Seed project for front component "${definition.name}" must have an index.tsx and an index.mjs file`,
        );
      }

      const sourceComponentPath = `${definition.id}/index.tsx`;
      const builtComponentPath = `${definition.id}/index.mjs`;

      await this.fileStorageService.writeFile({
        workspaceId,
        applicationUniversalIdentifier:
          ownerFlatApplication.universalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: sourceComponentPath,
        sourceFile: sourceFile.content,
        mimeType: 'application/typescript',
        settings: {
          isTemporaryFile: false,
          toDelete: false,
        },
      });

      await this.fileStorageService.writeFile({
        workspaceId,
        applicationUniversalIdentifier:
          ownerFlatApplication.universalIdentifier,
        fileFolder: FileFolder.BuiltFrontComponent,
        resourcePath: builtComponentPath,
        sourceFile: builtFile.content,
        mimeType: 'application/javascript',
        settings: {
          isTemporaryFile: false,
          toDelete: false,
        },
      });

      const checksum = crypto
        .createHash('md5')
        .update(builtFile.content)
        .digest('hex');

      await this.frontComponentService.createOne({
        workspaceId,
        ownerFlatApplication,
        input: {
          id: definition.id,
          universalIdentifier: definition.universalIdentifier,
          name: definition.name,
          description: definition.description,
          componentName: definition.componentName,
          sourceComponentPath,
          builtComponentPath,
          builtComponentChecksum: checksum,
          isHeadless: definition.isHeadless,
        },
      });
    }
  }
}
