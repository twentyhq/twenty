import { Module } from '@nestjs/common';

import { DataCleanInactiveCommand } from 'src/database/commands/clean-inactive-workspaces.command';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  providers: [DataCleanInactiveCommand, PrismaService],
})
export class DatabaseCommandModule {}
