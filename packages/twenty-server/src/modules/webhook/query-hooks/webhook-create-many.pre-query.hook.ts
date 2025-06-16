import { WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WebhookWorkspaceEntity } from 'src/modules/webhook/standard-objects/webhook.workspace-entity';

@WorkspaceQueryHook(`webhook.createMany`)
export class WebhookCreateManyPreQueryHook
  implements WorkspacePreQueryHookInstance
{
  async execute(): Promise<CreateManyResolverArgs<WebhookWorkspaceEntity>> {
    throw new GraphqlQueryRunnerException(
      'Method not allowed.',
      GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
    );
  }
}
