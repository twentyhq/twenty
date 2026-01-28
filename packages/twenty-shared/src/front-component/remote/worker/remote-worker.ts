import '@remote-dom/core/polyfill';
import '@remote-dom/react/polyfill';

import '../generated/remote-elements';

import { ThreadWebWorker } from '@quilted/threads';
import {
  BatchingRemoteConnection,
  type RemoteConnection,
  type RemoteRootElement,
} from '@remote-dom/core/elements';
import { createRoot } from 'react-dom/client';
import { type HostToWorkerRenderContext } from '../../types/HostToWorkerRenderContext';
import { type WorkerExports } from '../../types/WorkerExports';

const render: WorkerExports['render'] = async (
  connection: RemoteConnection,
  context: HostToWorkerRenderContext,
) => {
  const batchedConnection = new BatchingRemoteConnection(connection);
  const root = document.createElement('remote-root') as RemoteRootElement;
  root.connect(batchedConnection);
  document.body.append(root);

  const componentModule = await import(context.componentUrl);

  const reactRoot = createRoot(root);
  reactRoot.render(componentModule.default);
};

ThreadWebWorker.self.export({ render });
