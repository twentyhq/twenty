import { AsyncLocalStorage } from 'async_hooks';

import { isDefined } from 'twenty-shared/utils';

import {
  type WorkspaceCacheDataMap,
  type WorkspaceCacheKeyName,
} from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export type WorkspaceCachePin = {
  data: WorkspaceCacheDataMap[WorkspaceCacheKeyName];
  hash: string;
};

export type WorkspaceCacheRequestPins = Map<
  string,
  Map<WorkspaceCacheKeyName, WorkspaceCachePin>
>;

const workspaceCacheRequestPinsStorage =
  new AsyncLocalStorage<WorkspaceCacheRequestPins>();

export const createWorkspaceCacheRequestPins = (): WorkspaceCacheRequestPins =>
  new Map();

export const runWithWorkspaceCacheRequestPins = <TResult>(
  requestPins: WorkspaceCacheRequestPins,
  callback: () => TResult,
): TResult => workspaceCacheRequestPinsStorage.run(requestPins, callback);

export const getActiveWorkspaceCachePins = (
  workspaceId: string,
): Map<WorkspaceCacheKeyName, WorkspaceCachePin> | undefined => {
  const requestPins = workspaceCacheRequestPinsStorage.getStore();

  if (!isDefined(requestPins)) {
    return undefined;
  }

  const existingWorkspacePins = requestPins.get(workspaceId);

  if (isDefined(existingWorkspacePins)) {
    return existingWorkspacePins;
  }

  const workspacePins = new Map<WorkspaceCacheKeyName, WorkspaceCachePin>();

  requestPins.set(workspaceId, workspacePins);

  return workspacePins;
};

export const clearActiveWorkspaceCachePins = (workspaceId: string): void => {
  workspaceCacheRequestPinsStorage.getStore()?.delete(workspaceId);
};

export const getPinnedWorkspaceCacheHashes = (
  requestPins: WorkspaceCacheRequestPins,
  workspaceId: string,
): Partial<Record<WorkspaceCacheKeyName, string>> => {
  const workspacePins = requestPins.get(workspaceId);

  if (!isDefined(workspacePins)) {
    return {};
  }

  return Object.fromEntries(
    [...workspacePins.entries()].map(([keyName, pin]) => [keyName, pin.hash]),
  );
};
