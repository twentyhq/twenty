import { type HostAPI } from './HostApi';
import { type RemoteConnection } from '@remote-dom/core/elements';

export type SandboxAPI = {
  render: (connection: RemoteConnection, api: HostAPI) => Promise<void>;
};
