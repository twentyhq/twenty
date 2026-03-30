import { Injectable } from '@nestjs/common';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { QuoteNumberingService } from 'src/modules/quote/services/quote-numbering.service';

@WorkspaceQueryHook('quote.createOne')
@Injectable()
export class QuoteCreateOnePreQueryHook implements WorkspacePreQueryHookInstance {
  constructor(
    private readonly quoteNumberingService: QuoteNumberingService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: CreateOneResolverArgs,
  ): Promise<CreateOneResolverArgs> {
    const { quoteNumber, name } =
      await this.quoteNumberingService.assignNextNumber(
        authContext.workspace.id,
      );

    return {
      ...payload,
      data: {
        ...payload.data,
        quoteNumber,
        version: 1,
        name,
      },
    };
  }
}
