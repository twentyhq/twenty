import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma.module';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { WorkspaceRepository } from './workspace.repository';

@Module({
  imports: [PrismaModule],
  providers: [UserRepository, UserService, WorkspaceRepository],
  exports: [UserService, UserRepository, WorkspaceRepository],
})
export class UserModule {}