import { AsyncLocalStorage } from 'async_hooks';

import { type BillingEntitlements } from 'src/engine/core-modules/billing/types/billing-entitlements.type';

type WorkspaceDataContext = {
  workspaceId: string;
  billingEntitlements?: Promise<BillingEntitlements>;
};

export const workspaceDataContextStorage =
  new AsyncLocalStorage<WorkspaceDataContext>();

export const withWorkspaceDataContext = <TResult>(
  workspaceId: string,
  fn: () => TResult | Promise<TResult>,
): TResult | Promise<TResult> => {
  if (workspaceDataContextStorage.getStore()?.workspaceId === workspaceId) {
    return fn();
  }

  return workspaceDataContextStorage.run({ workspaceId }, fn);
};
