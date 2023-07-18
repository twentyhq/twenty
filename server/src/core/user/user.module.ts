import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { FileModule } from '../file/file.module';
import { WorkspaceModule } from '../workspace/workspace.module';

@Module({
  imports: [FileModule, WorkspaceModule],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
