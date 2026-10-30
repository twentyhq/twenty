import { readFrontComponentSharedDependenciesChecksum } from 'src/engine/metadata-modules/ai/ai-front-component/utils/read-front-component-shared-dependencies-checksum.util';
import { Injectable } from '@nestjs/common';
import { msg } from '@lingui/core/macro';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { createHash } from 'crypto';
import { text } from 'stream/consumers';

import {
  FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER,
  getAiFrontComponentSourcePath,
} from 'twenty-shared/application';
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

  async assertEnabledOrThrow(workspaceId: string) {
    if (!(await this.isEnabled(workspaceId))) {
      throw new ApplicationException(
        doNotTranslate('AI component builder is disabled.'),
        ApplicationExceptionCode.FORBIDDEN,
        { userFriendlyMessage: msg`AI component builder is disabled.` },
      );
    }
  }

  private async validateQueryOrThrow({
    query,
    authContext,
    rolePermissionConfig,
  }: {
    query: FrontComponentQuery;
    authContext: WorkspaceAuthContext;
    rolePermissionConfig?: ToolProviderContext['rolePermissionConfig'];
  }) {
    const { selectedFields } = await this.queryContext.build({
      authContext,
      objectName: query.objectName,
      rolePermissionConfig,
    });

    for (const fieldName of query.select) {
      if (!isDefined(selectedFields[fieldName])) {
        throw new ApplicationException(
          doNotTranslate(
            `Field ${query.objectName}.${fieldName} is unavailable. Select accessible top-level fields.`,
          ),
          ApplicationExceptionCode.FORBIDDEN,
          {
            userFriendlyMessage: msg`Field ${query.objectName}.${fieldName} is unavailable. Select accessible top-level fields.`,
          },
        );
      }
    }
  }

  private async readRecords({
    query,
    authContext,
    rolePermissionConfig,
  }: {
    query: FrontComponentQuery;
    authContext: WorkspaceAuthContext;
    rolePermissionConfig?: ToolProviderContext['rolePermissionConfig'];
  }) {
    await this.validateQueryOrThrow({
      query,
      authContext,
      rolePermissionConfig,
    });
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
      throw new ApplicationException(
        output.error ??
          output.warnings?.join(' ') ??
          doNotTranslate('Unable to read component records.'),
        ApplicationExceptionCode.INVALID_INPUT,
        { userFriendlyMessage: msg`Unable to read component records.` },
      );
    }

    return { ...output.result, count: Number(output.result.count) };
  }

  async getRecords({
    componentId,
    authContext,
  }: {
    componentId: string;
    authContext: WorkspaceAuthContext;
  }) {
    const workspaceId = authContext.workspace.id;

    await this.assertEnabledOrThrow(workspaceId);
    const component = await this.components.findById(componentId, workspaceId);
    const { workspaceCustomFlatApplication: application } =
      await this.applications.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    if (
      !isDefined(component) ||
      component.applicationId !== application.id ||
      component.sourceComponentPath !==
        getAiFrontComponentSourcePath(componentId)
    ) {
      throw new ApplicationException(
        doNotTranslate('AI front component not found.'),
        ApplicationExceptionCode.FRONT_COMPONENT_NOT_FOUND,
        { userFriendlyMessage: msg`AI front component not found.` },
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

    return this.readRecords({ query, authContext });
  }

  async getRuntime({
    componentId,
    authContext,
  }: {
    componentId: string;
    authContext: WorkspaceAuthContext;
  }) {
    const data = await this.getRecords({ componentId, authContext });
    const component = await this.components.findById(
      componentId,
      authContext.workspace.id,
    );

    if (
      !isDefined(component) ||
      component.sourceComponentPath !==
        getAiFrontComponentSourcePath(componentId)
    ) {
      throw new ApplicationException(
        doNotTranslate('Recreate this component with the current builder.'),
        ApplicationExceptionCode.FRONT_COMPONENT_NOT_FOUND,
        {
          userFriendlyMessage: msg`Recreate this component with the current builder.`,
        },
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
      throw new ApplicationException(
        doNotTranslate('Component source checksum mismatch.'),
        ApplicationExceptionCode.INVALID_INPUT,
        { userFriendlyMessage: msg`Component source checksum mismatch.` },
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
        throw new ApplicationException(
          doNotTranslate('Component shared dependencies are missing.'),
          ApplicationExceptionCode.INVALID_INPUT,
          {
            userFriendlyMessage: msg`Component shared dependencies are missing.`,
          },
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
        throw new ApplicationException(
          doNotTranslate('Component shared dependencies checksum mismatch.'),
          ApplicationExceptionCode.INVALID_INPUT,
          {
            userFriendlyMessage: msg`Component shared dependencies checksum mismatch.`,
          },
        );
      }
    }

    return {
      applicationId: application.id,
      componentSource,
      sharedDependenciesSource,
      sharedDependenciesChecksum,
      data,
    };
  }
}
