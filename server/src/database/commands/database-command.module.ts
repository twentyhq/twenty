import { Module } from '@nestjs/common';

import { DataCleanInactiveCommand } from 'src/database/commands/clean-inactive-workspaces.command';
import { ConfirmationQuestion } from 'src/database/commands/questions/confirmation.question';
import { PipelineModule } from 'src/core/pipeline/pipeline.module';
import { CompanyModule } from 'src/core/company/company.module';
import { PersonModule } from 'src/core/person/person.module';
import { PrismaModule } from 'src/database/prisma.module';
import { WorkspaceManagerModule } from 'src/workspace/workspace-manager/workspace-manager.module';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { WorkspaceMigrationModule } from 'src/metadata/workspace-migration/workspace-migration.module';
import { WorkspaceMigrationRunnerModule } from 'src/workspace/workspace-migration-runner/workspace-migration-runner.module';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { WorkspaceModule } from 'src/core/workspace/workspace.module';
import { DataSeedWorkspaceCommand } from 'src/database/commands/data-seed-workspace.command';

@Module({
  imports: [
    PipelineModule,
    CompanyModule,
    PersonModule,
    WorkspaceManagerModule,
    PrismaModule,
    DataSourceModule,
    TypeORMModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceModule,
  ],
  providers: [
    DataSeedWorkspaceCommand,
    DataCleanInactiveCommand,
    ConfirmationQuestion,
  ],
})
export class DatabaseCommandModule {}
