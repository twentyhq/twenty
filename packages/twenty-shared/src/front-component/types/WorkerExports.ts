import { type RemoteConnection } from '@remote-dom/core/elements';
import { type HostToWorkerRenderContext } from './HostToWorkerRenderContext';

export type WorkerExports = {
  render: (
    connection: RemoteConnection,
    context: HostToWorkerRenderContext,
  ) => Promise<void>;
};
