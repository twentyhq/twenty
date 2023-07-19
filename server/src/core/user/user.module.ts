import { Module } from '@nestjs/common';

import { FileModule } from 'src/core/file/file.module';
import { WorkspaceModule } from 'src/core/workspace/workspace.module';

import { UserService } from './user.service';
import { UserResolver } from './user.resolver';

@Module({
  imports: [FileModule, WorkspaceModule],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
