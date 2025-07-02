import { WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WebhookUrlValidationService } from 'src/modules/webhook/query-hooks/webhook-url-validation.service';
import { WebhookWorkspaceEntity } from 'src/modules/webhook/standard-objects/webhook.workspace-entity';

@WorkspaceQueryHook(`webhook.createOne`)
export class WebhookCreateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly webhookUrlValidationService: WebhookUrlValidationService,
  ) {}

  async execute(
    _authContext: AuthContext,
    _objectName: string,
    payload: CreateOneResolverArgs<WebhookWorkspaceEntity>,
  ): Promise<CreateOneResolverArgs<WebhookWorkspaceEntity>> {
    this.webhookUrlValidationService.validateWebhookUrl(payload.data.targetUrl);

    return payload;
  }
}
