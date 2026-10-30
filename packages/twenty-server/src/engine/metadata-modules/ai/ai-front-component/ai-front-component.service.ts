import { Injectable } from '@nestjs/common';
import { msg } from '@lingui/core/macro';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { text } from 'stream/consumers';

import { isAiFrontComponent } from 'src/engine/metadata-modules/ai/ai-front-component/utils/is-ai-front-component.util';
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
import { readFrontComponentQueryOrThrow } from 'src/engine/metadata-modules/ai/ai-front-component/utils/read-front-component-query-or-throw.util';

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

  async getRuntime({
    componentId,
    authContext,
  }: {
    componentId: string;
    authContext: WorkspaceAuthContext;
  }) {
    const workspaceId = authContext.workspace.id;

    await this.assertEnabledOrThrow(workspaceId);
    const component = await this.components.findById(componentId, workspaceId);
    const { workspaceCustomFlatApplication } =
      await this.applications.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    if (
      !isDefined(component) ||
      component.applicationId !== workspaceCustomFlatApplication.id ||
      !isAiFrontComponent(component)
    ) {
      throw new ApplicationException(
        doNotTranslate('AI front component not found.'),
        ApplicationExceptionCode.FRONT_COMPONENT_NOT_FOUND,
        { userFriendlyMessage: msg`AI front component not found.` },
      );
    }
    const queryFile = await this.files.readFile({
      workspaceId,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      fileFolder: FileFolder.Source,
      resourcePath: component.sourceComponentPath,
    });
    const content = await text(queryFile);
    const query = readFrontComponentQueryOrThrow(content);

    const data = await this.readRecords({ query, authContext });
    const application =
      await this.applications.findOneApplicationWithRelationsOrThrow({
        id: component.applicationId,
        workspaceId: authContext.workspace.id,
      });

    return {
      applicationId: application.id,
      builtComponentChecksum: component.builtComponentChecksum,
      sharedDependenciesChecksum:
        application.frontComponentSharedDependenciesChecksum,
      data,
    };
  }
}
