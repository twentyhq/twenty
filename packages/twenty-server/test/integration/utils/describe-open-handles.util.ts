import { ChildProcess } from 'node:child_process';
import { Server, Socket } from 'node:net';

const SETTLE_DELAY_MS = 1_000;

type ProcessWithActiveHandles = NodeJS.Process & {
  _getActiveHandles: () => unknown[];
};

type HandleWithRef = {
  _handle?: { hasRef?: () => boolean };
};

const isStandardStream = (handle: unknown) =>
  handle === process.stdin ||
  handle === process.stdout ||
  handle === process.stderr;

const isReferenced = (handle: unknown) =>
  (handle as HandleWithRef)._handle?.hasRef?.() ?? true;

const describeHandle = (handle: unknown): string => {
  if (handle instanceof Socket) {
    return `Socket ${handle.localAddress}:${handle.localPort} -> ${handle.remoteAddress}:${handle.remotePort} (destroyed: ${handle.destroyed})`;
  }

  if (handle instanceof Server) {
    return `Server listening on ${JSON.stringify(handle.address())}`;
  }

  if (handle instanceof ChildProcess) {
    return `ChildProcess ${handle.pid} ${handle.spawnfile}`;
  }

  return (handle as object | null)?.constructor?.name ?? String(handle);
};

// Jest only prints "did not exit" with no detail, so name what keeps the process alive
export const describeOpenHandles = async (): Promise<string[]> => {
  await new Promise((resolve) => setTimeout(resolve, SETTLE_DELAY_MS));

  const handleDescriptions = (process as ProcessWithActiveHandles)
    ._getActiveHandles()
    .filter((handle) => !isStandardStream(handle) && isReferenced(handle))
    .map(describeHandle);

  // timers are not handles, they only show up as resources
  const timerCount = process
    .getActiveResourcesInfo()
    .filter((resourceType) => resourceType === 'Timeout').length;

  return timerCount > 0
    ? [...handleDescriptions, `${timerCount} referenced timer(s)`]
    : handleDescriptions;
};
