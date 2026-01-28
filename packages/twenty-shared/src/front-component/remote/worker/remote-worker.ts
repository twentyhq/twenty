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
import { type HostAPI } from '../../types/HostApi';
import { type SandboxAPI } from '../../types/SandboxApi';

ThreadWebWorker.self.export<SandboxAPI>({
  render: async (connection: RemoteConnection, api: HostAPI) => {
    const batchedConnection = new BatchingRemoteConnection(connection);
    const root = document.createElement('remote-root') as RemoteRootElement;
    root.connect(batchedConnection);
    document.body.append(root);

    const componentModule = await import(api.componentUrl);

    const reactRoot = createRoot(root);
    reactRoot.render(componentModule.default);
  },
});
