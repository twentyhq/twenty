import { Injectable } from '@nestjs/common';

import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { QuoteTotalsService } from 'src/modules/quote/services/quote-totals.service';

type LineItemRecord = {
  id: string;
  quoteSectionId?: string;
};

// Extract id and quoteSectionId from the hook payload (array or single record).
function extractLineItem(payload: unknown): LineItemRecord | null {
  const record = Array.isArray(payload) ? payload[0] : payload;

  if (!record || typeof record !== 'object') {
    return null;
  }

  return record as LineItemRecord;
}

@WorkspaceQueryHook({
  key: 'lineItem.createOne',
  type: WorkspaceQueryHookType.POST_HOOK,
})
@Injectable()
export class QuoteLineItemCreateOnePostQueryHook
  implements WorkspacePostQueryHookInstance
{
  constructor(private readonly quoteTotalsService: QuoteTotalsService) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: unknown,
  ): Promise<void> {
    const record = extractLineItem(payload);

    if (!record) {
      return;
    }

    await this.quoteTotalsService.recomputeFromLineItem(
      authContext.workspace.id,
      record.id,
    );
  }
}

@WorkspaceQueryHook({
  key: 'lineItem.updateOne',
  type: WorkspaceQueryHookType.POST_HOOK,
})
@Injectable()
export class QuoteLineItemUpdateOnePostQueryHook
  implements WorkspacePostQueryHookInstance
{
  constructor(private readonly quoteTotalsService: QuoteTotalsService) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: unknown,
  ): Promise<void> {
    const record = extractLineItem(payload);

    if (!record) {
      return;
    }

    await this.quoteTotalsService.recomputeFromLineItem(
      authContext.workspace.id,
      record.id,
    );
  }
}

@WorkspaceQueryHook({
  key: 'lineItem.deleteOne',
  type: WorkspaceQueryHookType.POST_HOOK,
})
@Injectable()
export class QuoteLineItemDeleteOnePostQueryHook
  implements WorkspacePostQueryHookInstance
{
  constructor(private readonly quoteTotalsService: QuoteTotalsService) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: unknown,
  ): Promise<void> {
    const record = extractLineItem(payload);

    // After deleteOne the item is soft-deleted so recomputeFromLineItem won't
    // find it.  Use the section ID carried in the payload to roll up directly.
    if (!record?.quoteSectionId) {
      return;
    }

    await this.quoteTotalsService.recomputeFromSectionId(
      authContext.workspace.id,
      record.quoteSectionId,
    );
  }
}
