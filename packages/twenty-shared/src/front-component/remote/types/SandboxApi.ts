import { type HostAPI } from '@/front-component/remote/types/HostApi';
import { type RemoteConnection } from '@remote-dom/core/elements';

export type SandboxAPI = {
  render: (connection: RemoteConnection, api: HostAPI) => Promise<void>;
};
