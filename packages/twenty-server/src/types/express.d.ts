import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApiKeyWorkspaceEntity } from 'src/modules/api-key/standard-objects/api-key.workspace-entity';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

declare module 'express-serve-static-core' {
  interface Request {
    locale?: string;
    user?: User | null;
    workspace?: Workspace;
    apiKey?: ApiKeyWorkspaceEntity | null;
    workspaceId?: string;
    workspaceMetadataVersion?: number;
    workspaceMemberId?: string;
    userWorkspaceId?: string;
    authProvider?: AuthProviderEnum | null;
  }
}
