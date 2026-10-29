import { extractChecksumFromCacheKey } from 'src/engine/core-modules/application/front-component-shared-dependencies/utils/extract-checksum-from-cache-key.util';
import { getFrontComponentSharedDependenciesPath } from 'src/engine/metadata-modules/ai/ai-front-component/utils/get-front-component-shared-dependencies-path.util';
import { readFrontComponentSharedDependenciesChecksum } from 'src/engine/metadata-modules/ai/ai-front-component/utils/read-front-component-shared-dependencies-checksum.util';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { text } from 'stream/consumers';

import { FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER } from 'twenty-shared/application';
import { FeatureFlagKey, FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { FrontComponentService } from 'src/engine/metadata-modules/front-component/front-component.service';
import { type FrontComponentQuery } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-query.type';
import { readFrontComponentQuery } from 'src/engine/metadata-modules/ai/ai-front-component/utils/read-front-component-query.util';

@Injectable()
export class AiFrontComponentService {
  constructor(
    private readonly featureFlags: FeatureFlagService,
    private readonly applications: ApplicationService,
    private readonly files: FileStorageService,
    private readonly components: FrontComponentService,
    private readonly queryContext: CommonApiContextBuilderService,
    private readonly records: FindRecordsService,
  ) {}

  private isEnabled(workspaceId: string) {
    return this.featureFlags.isFeatureEnabled(
      FeatureFlagKey.IS_AI_CHAT_COMPONENT_BUILDER_ENABLED,
      workspaceId,
    );
  }

  async assertEnabled(workspaceId: string) {
    if (!(await this.isEnabled(workspaceId))) {
      throw new ForbiddenException(
        doNotTranslate('AI component builder is disabled.'),
      );
    }
  }

  private async validateQuery(
    query: FrontComponentQuery,
    authContext: WorkspaceAuthContext,
    rolePermissionConfig?: ToolProviderContext['rolePermissionConfig'],
  ) {
    const { selectedFields } = await this.queryContext.build({
      authContext,
      objectName: query.objectName,
      rolePermissionConfig,
    });

    for (const fieldName of query.select) {
      if (!isDefined(selectedFields[fieldName])) {
        throw new ForbiddenException(
          doNotTranslate(
            `Field ${query.objectName}.${fieldName} is unavailable. Select accessible top-level fields.`,
          ),
        );
      }
    }
  }

  private async readRecords(
    query: FrontComponentQuery,
    authContext: WorkspaceAuthContext,
    rolePermissionConfig?: ToolProviderContext['rolePermissionConfig'],
  ) {
    await this.validateQuery(query, authContext, rolePermissionConfig);
    const output = await this.records.execute({
      ...query,
      authContext,
      rolePermissionConfig,
      shouldBuildEffectiveSelectFields: true,
    });

    if (
      !output.success ||
      !isDefined(output.result) ||
      isDefined(output.warnings)
    ) {
      throw new BadRequestException(
        output.error ??
          output.warnings?.join(' ') ??
          doNotTranslate('Unable to read component records.'),
      );
    }

    return { ...output.result, count: Number(output.result.count) };
  }

  async getRecords(componentId: string, authContext: WorkspaceAuthContext) {
    const workspaceId = authContext.workspace.id;

    await this.assertEnabled(workspaceId);
    const component = await this.components.findById(componentId, workspaceId);
    const { workspaceCustomFlatApplication: application } =
      await this.applications.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    if (
      !isDefined(component) ||
      component.applicationId !== application.id ||
      component.sourceComponentPath !==
        `src/ai-front-components/${componentId}.front-component.tsx`
    ) {
      throw new NotFoundException(
        doNotTranslate('AI front component not found.'),
      );
    }
    const queryFile = await this.files.readFile({
      workspaceId,
      applicationUniversalIdentifier: application.universalIdentifier,
      fileFolder: FileFolder.Source,
      resourcePath: component.sourceComponentPath,
    });
    const content = await text(queryFile);
    const query = readFrontComponentQuery(content);

    return this.readRecords(query, authContext);
  }

  async getRuntime(componentId: string, authContext: WorkspaceAuthContext) {
    const data = await this.getRecords(componentId, authContext);
    const component = await this.components.findById(
      componentId,
      authContext.workspace.id,
    );

    if (
      !isDefined(component) ||
      component.sourceComponentPath !==
        `src/ai-front-components/${componentId}.front-component.tsx`
    ) {
      throw new NotFoundException(
        doNotTranslate('Recreate this component with the current builder.'),
      );
    }
    const { workspaceCustomFlatApplication: application } =
      await this.applications.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId: authContext.workspace.id },
      );
    const componentSource = await text(
      await this.files.readFile({
        workspaceId: authContext.workspace.id,
        applicationUniversalIdentifier: application.universalIdentifier,
        fileFolder: FileFolder.BuiltFrontComponent,
        resourcePath: component.builtComponentPath,
      }),
    );

    if (
      createHash('sha256').update(componentSource).digest('hex') !==
      component.builtComponentChecksum
    ) {
      throw new BadRequestException(
        doNotTranslate('Component source checksum mismatch.'),
      );
    }

    let sharedDependenciesSource: string | undefined;
    const sharedDependenciesChecksum =
      readFrontComponentSharedDependenciesChecksum(componentSource);

    if (
      componentSource.includes(
        FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER,
      ) &&
      !isDefined(sharedDependenciesChecksum)
    ) {
      const applicationDependencies =
        await this.applications.findOneApplicationWithRelationsOrThrow({
          id: application.id,
          workspaceId: authContext.workspace.id,
        });

      if (
        !isDefined(
          applicationDependencies.frontComponentSharedDependenciesBuiltPath,
        )
      ) {
        throw new BadRequestException(
          doNotTranslate('Component shared dependencies are missing.'),
        );
      }
      sharedDependenciesSource = await text(
        await this.files.readFile({
          workspaceId: authContext.workspace.id,
          applicationUniversalIdentifier: application.universalIdentifier,
          fileFolder: FileFolder.BuiltFrontComponent,
          resourcePath:
            applicationDependencies.frontComponentSharedDependenciesBuiltPath,
        }),
      );
      if (
        createHash('sha256').update(sharedDependenciesSource).digest('hex') !==
        applicationDependencies.frontComponentSharedDependenciesChecksum
      ) {
        throw new BadRequestException(
          doNotTranslate('Component shared dependencies checksum mismatch.'),
        );
      }
    }

    return {
      componentSource,
      sharedDependenciesSource,
      sharedDependenciesChecksum,
      data,
    };
  }

  async getSharedDependencies(
    cacheKey: string,
    authContext: WorkspaceAuthContext,
  ) {
    const workspaceId = authContext.workspace.id;
    await this.assertEnabled(workspaceId);
    const checksum = extractChecksumFromCacheKey(cacheKey);

    if (!isDefined(checksum)) {
      throw new BadRequestException(
        doNotTranslate('Invalid component shared dependencies checksum.'),
      );
    }
    const { workspaceCustomFlatApplication: application } =
      await this.applications.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const source = await text(
      await this.files.readFile({
        workspaceId,
        applicationUniversalIdentifier: application.universalIdentifier,
        fileFolder: FileFolder.BuiltFrontComponent,
        resourcePath: getFrontComponentSharedDependenciesPath(checksum),
      }),
    );

    if (createHash('sha256').update(source).digest('hex') !== checksum) {
      throw new BadRequestException(
        doNotTranslate('Component shared dependencies checksum mismatch.'),
      );
    }

    return source;
  }
}
