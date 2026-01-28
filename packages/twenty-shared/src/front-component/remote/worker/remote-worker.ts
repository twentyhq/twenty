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
  renderContext: HostToWorkerRenderContext,
) => {
  const batchedConnection = new BatchingRemoteConnection(connection);
  const root = document.createElement('remote-root') as RemoteRootElement;
  root.connect(batchedConnection);
  document.body.append(root);

  // TODO: Add a way to verify the component URL is valid (signed URL, content hash, etc.)
  const componentModule = await import(renderContext.componentUrl);

  const reactRoot = createRoot(root);
  reactRoot.render(componentModule.default);
};

ThreadWebWorker.self.export({ render });
