// Must import polyfill FIRST to provide HTMLElement and other DOM globals in the worker
import '@remote-dom/core/polyfill';
import '@remote-dom/react/polyfill';

// Import remote elements to register custom elements
import '../generated/elements';

import { ThreadWebWorker } from '@quilted/threads';
import {
  BatchingRemoteConnection,
  type RemoteConnection,
  type RemoteRootElement,
} from '@remote-dom/core/elements';
import { createRoot } from 'react-dom/client';
import { type HostAPI } from '../../types/HostApi';
import { type SandboxAPI } from '../../types/SandboxApi';

ThreadWebWorker.self.export<SandboxAPI>({
  render: async (connection: RemoteConnection, api: HostAPI) => {
    const batchedConnection = new BatchingRemoteConnection(connection);
    const root = document.createElement('remote-root') as RemoteRootElement;
    root.connect(batchedConnection);
    document.body.append(root);

    createRoot(root).render(api.componentCode);
  },
});
