import { Module } from '@nestjs/common';

import { DataCleanInactiveCommand } from 'src/database/commands/clean-inactive-workspaces.command';
import { PrismaService } from 'src/database/prisma.service';
import { ConfirmationQuestion } from 'src/database/commands/confirmation.question';
import { WorkspaceService } from 'src/core/workspace/services/workspace.service';

@Module({
  providers: [
    DataCleanInactiveCommand,
    ConfirmationQuestion,
    PrismaService,
    WorkspaceService,
  ],
})
export class DatabaseCommandModule {}
