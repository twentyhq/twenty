import { Module } from '@nestjs/common';

import { FileModule } from 'src/core/file/file.module';
import { WorkspaceModule } from 'src/core/workspace/workspace.module';
import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { AbilityModule } from 'src/ability/ability.module';
import { PrismaModule } from 'src/database/prisma.module';

import { UserService } from './user.service';
import { UserResolver } from './user.resolver';

@Module({
  imports: [
    FileModule,
    WorkspaceModule,
    EnvironmentModule,
    AbilityModule,
    PrismaModule,
  ],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
