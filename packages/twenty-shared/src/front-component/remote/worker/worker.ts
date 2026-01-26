import { type HostAPI } from '@/front-component/remote/types/HostApi';
import { type SandboxAPI } from '@/front-component/remote/types/SandboxApi';
import { ThreadWebWorker } from '@quilted/threads';
import {
  BatchingRemoteConnection,
  type RemoteConnection,
  type RemoteRootElement,
} from '@remote-dom/core/elements';
import { createRoot } from 'react-dom/client';

ThreadWebWorker.self.export<SandboxAPI>({
  render: async (connection: RemoteConnection, api: HostAPI) => {
    const batchedConnection = new BatchingRemoteConnection(connection);
    const root = document.createElement('remote-root') as RemoteRootElement;
    root.connect(batchedConnection);
    document.body.append(root);

    createRoot(root).render(api.componentToRender);
  },
});
