import { YogaDriverServerContext } from '@graphql-yoga/nestjs';

import { User } from 'src/core/user/user.entity';
import { Workspace } from 'src/core/workspace/workspace.entity';

export interface GraphQLContext extends YogaDriverServerContext<'express'> {
  user?: User;
  workspace?: Workspace;
}
