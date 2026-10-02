import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export type InFlightWorkspaceCacheRecompute = {
  workspaceId: string;
  cacheKeyNames: ReadonlySet<WorkspaceCacheKeyName>;
  supersededCacheKeyNames: Set<WorkspaceCacheKeyName>;
};

export class WorkspaceCacheInFlightRecomputes {
  private readonly recomputesByWorkspaceId = new Map<
    string,
    Set<InFlightWorkspaceCacheRecompute>
  >();

  start(
    workspaceId: string,
    cacheKeyNames: WorkspaceCacheKeyName[],
  ): InFlightWorkspaceCacheRecompute {
    const recompute: InFlightWorkspaceCacheRecompute = {
      workspaceId,
      cacheKeyNames: new Set(cacheKeyNames),
      supersededCacheKeyNames: new Set(),
    };
    const workspaceRecomputes =
      this.recomputesByWorkspaceId.get(workspaceId) ?? new Set();

    workspaceRecomputes.add(recompute);
    this.recomputesByWorkspaceId.set(workspaceId, workspaceRecomputes);

    return recompute;
  }

  finish(recompute: InFlightWorkspaceCacheRecompute): void {
    const workspaceRecomputes = this.recomputesByWorkspaceId.get(
      recompute.workspaceId,
    );

    workspaceRecomputes?.delete(recompute);

    if (workspaceRecomputes?.size === 0) {
      this.recomputesByWorkspaceId.delete(recompute.workspaceId);
    }
  }

  supersede(workspaceId: string, cacheKeyNames: WorkspaceCacheKeyName[]): void {
    const workspaceRecomputes = this.recomputesByWorkspaceId.get(workspaceId);

    if (!isDefined(workspaceRecomputes)) {
      return;
    }

    for (const recompute of workspaceRecomputes) {
      for (const cacheKeyName of cacheKeyNames) {
        if (recompute.cacheKeyNames.has(cacheKeyName)) {
          recompute.supersededCacheKeyNames.add(cacheKeyName);
        }
      }
    }
  }

  isSuperseded(
    recompute: InFlightWorkspaceCacheRecompute,
    cacheKeyName: WorkspaceCacheKeyName,
  ): boolean {
    return recompute.supersededCacheKeyNames.has(cacheKeyName);
  }
}
