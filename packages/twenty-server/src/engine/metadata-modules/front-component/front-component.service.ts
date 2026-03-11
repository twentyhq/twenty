import { Injectable } from '@nestjs/common';

import * as fs from 'fs/promises';
import { join } from 'path';
import { Readable } from 'stream';

import { build } from 'esbuild';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { SdkClientGenerationService } from 'src/engine/core-modules/logic-function/logic-function-resource/sdk-client-generation.service';
import { TemporaryDirManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/temporary-dir-manager';
import { streamToBuffer } from 'src/utils/stream-to-buffer';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { fromCreateFrontComponentInputToFlatFrontComponentToCreate } from 'src/engine/metadata-modules/flat-front-component/utils/from-create-front-component-input-to-flat-front-component-to-create.util';
import { fromFlatFrontComponentToFrontComponentDto } from 'src/engine/metadata-modules/flat-front-component/utils/from-flat-front-component-to-front-component-dto.util';
import { fromUpdateFrontComponentInputToFlatFrontComponentToUpdateOrThrow } from 'src/engine/metadata-modules/flat-front-component/utils/from-update-front-component-input-to-flat-front-component-to-update-or-throw.util';
import { type CreateFrontComponentInput } from 'src/engine/metadata-modules/front-component/dtos/create-front-component.input';
import { type FrontComponentDTO } from 'src/engine/metadata-modules/front-component/dtos/front-component.dto';
import { type UpdateFrontComponentInput } from 'src/engine/metadata-modules/front-component/dtos/update-front-component.input';
import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class FrontComponentService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    private readonly fileStorageService: FileStorageService,
    private readonly sdkClientGenerationService: SdkClientGenerationService,
  ) {}

  async findAll(workspaceId: string): Promise<FrontComponentDTO[]> {
    const { flatFrontComponentMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFrontComponentMaps'],
        },
      );

    return Object.values(flatFrontComponentMaps.byUniversalIdentifier)
      .filter(isDefined)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(fromFlatFrontComponentToFrontComponentDto);
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<FrontComponentDTO | null> {
    const { flatFrontComponentMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFrontComponentMaps'],
        },
      );

    const flatFrontComponent = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatFrontComponentMaps,
    });

    if (!isDefined(flatFrontComponent)) {
      return null;
    }

    return fromFlatFrontComponentToFrontComponentDto(flatFrontComponent);
  }

  async createOne({
    input,
    workspaceId,
    ownerFlatApplication,
  }: {
    input: Omit<CreateFrontComponentInput, 'applicationId'>;
    workspaceId: string;
    ownerFlatApplication?: FlatApplication;
  }): Promise<FlatFrontComponent> {
    const resolvedOwnerFlatApplication =
      ownerFlatApplication ??
      (
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        )
      ).workspaceCustomFlatApplication;

    const flatFrontComponentToCreate =
      fromCreateFrontComponentInputToFlatFrontComponentToCreate({
        createFrontComponentInput: input,
        workspaceId,
        flatApplication: resolvedOwnerFlatApplication,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            frontComponent: {
              flatEntityToCreate: [flatFrontComponentToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            resolvedOwnerFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating front component',
      );
    }

    const { flatFrontComponentMaps: recomputedFlatFrontComponentMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFrontComponentMaps'],
        },
      );

    const createdFlatFrontComponent = findFlatEntityByIdInFlatEntityMapsOrThrow(
      {
        flatEntityId: flatFrontComponentToCreate.id,
        flatEntityMaps: recomputedFlatFrontComponentMaps,
      },
    );

    return createdFlatFrontComponent;
  }

  async updateOne({
    id,
    update,
    workspaceId,
    ownerFlatApplication,
  }: {
    id: string;
    update: UpdateFrontComponentInput['update'];
    workspaceId: string;
    ownerFlatApplication?: FlatApplication;
  }): Promise<FlatFrontComponent> {
    const resolvedOwnerFlatApplication =
      ownerFlatApplication ??
      (
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        )
      ).workspaceCustomFlatApplication;

    const { flatFrontComponentMaps: existingFlatFrontComponentMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFrontComponentMaps'],
        },
      );

    const flatFrontComponentToUpdate =
      fromUpdateFrontComponentInputToFlatFrontComponentToUpdateOrThrow({
        flatFrontComponentMaps: existingFlatFrontComponentMaps,
        updateFrontComponentInput: { id, update },
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            frontComponent: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatFrontComponentToUpdate],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            resolvedOwnerFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating front component',
      );
    }

    const { flatFrontComponentMaps: recomputedFlatFrontComponentMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFrontComponentMaps'],
        },
      );

    const updatedFlatFrontComponent = findFlatEntityByIdInFlatEntityMapsOrThrow(
      {
        flatEntityId: id,
        flatEntityMaps: recomputedFlatFrontComponentMaps,
      },
    );

    return updatedFlatFrontComponent;
  }

  async destroyOne({
    id,
    workspaceId,
    isSystemBuild = false,
    ownerFlatApplication,
  }: {
    id: string;
    workspaceId: string;
    isSystemBuild?: boolean;
    ownerFlatApplication?: FlatApplication;
  }): Promise<FlatFrontComponent> {
    const resolvedOwnerFlatApplication =
      ownerFlatApplication ??
      (
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        )
      ).workspaceCustomFlatApplication;

    const { flatFrontComponentMaps: existingFlatFrontComponentMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFrontComponentMaps'],
        },
      );

    const existingFlatFrontComponent = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: existingFlatFrontComponentMaps,
    });

    if (!isDefined(existingFlatFrontComponent)) {
      throw new FrontComponentException(
        'Front component to destroy not found',
        FrontComponentExceptionCode.FRONT_COMPONENT_NOT_FOUND,
      );
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            frontComponent: {
              flatEntityToCreate: [],
              flatEntityToDelete: [existingFlatFrontComponent],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild,
          applicationUniversalIdentifier:
            resolvedOwnerFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while destroying front component',
      );
    }

    return existingFlatFrontComponent;
  }

  async findByIdOrThrow(
    id: string,
    workspaceId: string,
  ): Promise<FrontComponentDTO> {
    const frontComponent = await this.findById(id, workspaceId);

    if (!isDefined(frontComponent)) {
      throw new FrontComponentException(
        'Front component not found',
        FrontComponentExceptionCode.FRONT_COMPONENT_NOT_FOUND,
      );
    }

    return frontComponent;
  }

  async getBuiltComponentStream({
    frontComponentId,
    workspaceId,
  }: {
    frontComponentId: string;
    workspaceId: string;
  }): Promise<Readable> {
    const frontComponent = await this.findByIdOrThrow(
      frontComponentId,
      workspaceId,
    );

    const application = await this.applicationService.findOneApplicationOrThrow(
      {
        id: frontComponent.applicationId,
        workspaceId,
      },
    );

    const applicationUniversalIdentifier = application.universalIdentifier;

    const rawStream = await this.fileStorageService.readFile({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.BuiltFrontComponent,
      resourcePath: frontComponent.builtComponentPath,
    });

    const rawSource = (await streamToBuffer(rawStream)).toString('utf-8');

    const hasSdkImport =
      rawSource.includes('twenty-client-sdk/core') ||
      rawSource.includes('twenty-client-sdk');

    if (!hasSdkImport) {
      return Readable.from(Buffer.from(rawSource));
    }

    return this.bundleWithSdkClient({
      rawSource,
      workspaceId,
      applicationUniversalIdentifier,
    });
  }

  // Re-bundles the front component .mjs with the generated
  // twenty-client-sdk inlined so the output is self-contained.
  private async bundleWithSdkClient({
    rawSource,
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    rawSource: string;
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): Promise<Readable> {
    const temporaryDirManager = new TemporaryDirManager();

    try {
      const { sourceTemporaryDir } = await temporaryDirManager.init();

      const entryPath = join(sourceTemporaryDir, 'entry.mjs');

      await fs.writeFile(entryPath, rawSource);

      const sdkPackagePath = join(
        sourceTemporaryDir,
        'node_modules',
        'twenty-client-sdk',
      );

      await fs.mkdir(join(sourceTemporaryDir, 'node_modules'), {
        recursive: true,
      });

      await this.sdkClientGenerationService.downloadAndExtractToPackage({
        workspaceId,
        applicationUniversalIdentifier,
        targetPackagePath: sdkPackagePath,
      });

      const result = await build({
        entryPoints: [entryPath],
        bundle: true,
        format: 'esm',
        write: false,
        nodePaths: [join(sourceTemporaryDir, 'node_modules')],
        logLevel: 'silent',
      });

      const bundledCode = result.outputFiles?.[0]?.text ?? rawSource;

      return Readable.from(Buffer.from(bundledCode));
    } finally {
      await temporaryDirManager.clean();
    }
  }
}
