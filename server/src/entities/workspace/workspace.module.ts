import { Module } from '@nestjs/common';
import { WorkspaceRepository } from './workspace.repository';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [WorkspaceRepository],
  exports: [WorkspaceRepository],
})
export class WorkspaceModule {}
