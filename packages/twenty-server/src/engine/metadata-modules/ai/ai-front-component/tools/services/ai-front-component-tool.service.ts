import { Injectable } from '@nestjs/common';
import { type ToolSet } from 'ai';
import { PREVIEW_FRONT_COMPONENT_TOOL_NAME } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { AiFrontComponentService } from 'src/engine/metadata-modules/ai/ai-front-component/ai-front-component.service';
import { PUBLISH_FRONT_COMPONENT_TOOL } from 'src/engine/metadata-modules/ai/ai-front-component/constants/publish-front-component-tool.constant';
import { createInspectFrontComponentTool } from 'src/engine/metadata-modules/ai/ai-front-component/tools/inspect-front-component.tool';
import { createListFrontComponentsTool } from 'src/engine/metadata-modules/ai/ai-front-component/tools/list-front-components.tool';
import { createPreviewFrontComponentTool } from 'src/engine/metadata-modules/ai/ai-front-component/tools/preview-front-component.tool';
import { createPublishFrontComponentTool } from 'src/engine/metadata-modules/ai/ai-front-component/tools/publish-front-component.tool';
import { FrontComponentService } from 'src/engine/metadata-modules/front-component/front-component.service';
import { PermissionsService } from 'src/engine/permissions/permissions.service';

@Injectable()
export class AiFrontComponentToolService {
  constructor(
    private readonly aiFrontComponentService: AiFrontComponentService,
    private readonly frontComponentService: FrontComponentService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async generateTools(context: ToolProviderContext): Promise<ToolSet> {
    const { userWorkspaceId } = context;

    if (
      !isDefined(userWorkspaceId) ||
      !(await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_AI_CHAT_COMPONENT_BUILDER_ENABLED,
        context.workspaceId,
      )) ||
      !(await this.permissionsService.checkRolesPermissions(
        context.rolePermissionConfig,
        context.workspaceId,
        PermissionFlagType.APPLICATIONS,
      ))
    ) {
      return {};
    }

    return {
      list_front_components: createListFrontComponentsTool({
        frontComponentService: this.frontComponentService,
        workspaceId: context.workspaceId,
        callingApplication: context.application,
        workspaceCustomApplicationId:
          context.authContext?.workspace.workspaceCustomApplicationId,
      }),
      [PREVIEW_FRONT_COMPONENT_TOOL_NAME]: createPreviewFrontComponentTool({
        aiFrontComponentService: this.aiFrontComponentService,
        context,
      }),
      inspect_front_component: createInspectFrontComponentTool({
        aiFrontComponentService: this.aiFrontComponentService,
        context: { workspaceId: context.workspaceId, userWorkspaceId },
      }),
      [PUBLISH_FRONT_COMPONENT_TOOL.name]: createPublishFrontComponentTool({
        aiFrontComponentService: this.aiFrontComponentService,
        context,
      }),
    };
  }
}
