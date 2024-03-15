import { User } from 'src/engine/modules/user/user.entity';
import { Workspace } from 'src/engine/modules/workspace/workspace.entity';

export type JwtData = {
  user?: User | undefined;
  workspace: Workspace;
};
