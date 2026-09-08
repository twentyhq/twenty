import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { InboundActivityNameService } from 'src/modules/enso/inbound-activity/services/inbound-activity-name.service';

@Injectable()
@WorkspaceQueryHook(`inboundActivity.updateOne`)
export class InboundActivityUpdateOnePreQueryHook implements WorkspacePreQueryHookInstance {
  constructor(
    private readonly inboundActivityNameService: InboundActivityNameService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs<Record<string, unknown>>,
  ): Promise<UpdateOneResolverArgs<Record<string, unknown>>> {
    if (!isDefined(payload.data)) {
      return payload;
    }

    // Recompute only when an input that feeds the label changed.
    const touchesNameInputs =
      'kind' in payload.data ||
      'personId' in payload.data ||
      'projectId' in payload.data ||
      'occurredAt' in payload.data ||
      'callerE164' in payload.data ||
      'attendeeEmail' in payload.data;

    if (!touchesNameInputs) {
      return payload;
    }

    const name = await this.inboundActivityNameService.computeName(
      authContext,
      { ...payload.data, id: payload.id },
    );

    if (!isDefined(name)) {
      return payload;
    }

    return { ...payload, data: { ...payload.data, name } };
  }
}
