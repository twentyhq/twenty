import { Module } from '@nestjs/common';

import { DataCleanInactiveCommand } from 'src/database/commands/clean-inactive-workspaces.command';
import { ConfirmationQuestion } from 'src/database/commands/questions/confirmation.question';
import { PipelineModule } from 'src/core/pipeline/pipeline.module';
import { CompanyModule } from 'src/core/company/company.module';
import { PersonModule } from 'src/core/person/person.module';
import { PrismaModule } from 'src/database/prisma.module';
import { TenantManagerModule } from 'src/tenant-manager/tenant-manager.module';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { TenantMigrationModule } from 'src/metadata/tenant-migration/tenant-migration.module';
import { TenantMigrationRunnerModule } from 'src/tenant-migration-runner/tenant-migration-runner.module';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { WorkspaceModule } from 'src/core/workspace/workspace.module';

import { DataSeedTenantCommand } from './data-seed-tenant.command';

@Module({
  imports: [
    PipelineModule,
    CompanyModule,
    PersonModule,
    TenantManagerModule,
    PrismaModule,
    DataSourceModule,
    TypeORMModule,
    TenantMigrationModule,
    TenantMigrationRunnerModule,
    WorkspaceModule,
  ],
  providers: [
    DataSeedTenantCommand,
    DataCleanInactiveCommand,
    ConfirmationQuestion,
  ],
})
export class DatabaseCommandModule {}
