import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserRelationsResolver } from './user-relations.resolver';
import { WorkspaceModule } from '../workspace/workspace.module';

@Module({
  imports: [WorkspaceModule],
  providers: [UserService, UserResolver, UserRelationsResolver],
  exports: [UserService],
})
export class UserModule {}
