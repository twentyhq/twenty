import { Injectable } from '@nestjs/common';

import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { QuoteTotalsService } from 'src/modules/quote/services/quote-totals.service';

type QuoteTermRecord = {
  owningSectionQuotationQuoteSectionId?: string | null;
};

function extractTerm(payload: unknown): QuoteTermRecord | null {
  const record = Array.isArray(payload) ? payload[0] : payload;

  if (!record || typeof record !== 'object') {
    return null;
  }

  return record as QuoteTermRecord;
}

async function recomputeFromPayload(
  authContext: WorkspaceAuthContext,
  payload: unknown,
  quoteTotalsService: QuoteTotalsService,
): Promise<void> {
  const record = extractTerm(payload);

  if (!record) {
    return;
  }

  await quoteTotalsService.recomputeFromTerm(authContext.workspace.id, {
    owningSectionQuotationQuoteSectionId:
      record.owningSectionQuotationQuoteSectionId ?? null,
  });
}

@WorkspaceQueryHook({
  key: 'quoteTerm.createOne',
  type: WorkspaceQueryHookType.POST_HOOK,
})
@Injectable()
export class QuoteTermCreateOnePostQueryHook
  implements WorkspacePostQueryHookInstance
{
  constructor(private readonly quoteTotalsService: QuoteTotalsService) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: unknown,
  ): Promise<void> {
    await recomputeFromPayload(authContext, payload, this.quoteTotalsService);
  }
}

@WorkspaceQueryHook({
  key: 'quoteTerm.updateOne',
  type: WorkspaceQueryHookType.POST_HOOK,
})
@Injectable()
export class QuoteTermUpdateOnePostQueryHook
  implements WorkspacePostQueryHookInstance
{
  constructor(private readonly quoteTotalsService: QuoteTotalsService) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: unknown,
  ): Promise<void> {
    await recomputeFromPayload(authContext, payload, this.quoteTotalsService);
  }
}

@WorkspaceQueryHook({
  key: 'quoteTerm.deleteOne',
  type: WorkspaceQueryHookType.POST_HOOK,
})
@Injectable()
export class QuoteTermDeleteOnePostQueryHook
  implements WorkspacePostQueryHookInstance
{
  constructor(private readonly quoteTotalsService: QuoteTotalsService) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: unknown,
  ): Promise<void> {
    await recomputeFromPayload(authContext, payload, this.quoteTotalsService);
  }
}
