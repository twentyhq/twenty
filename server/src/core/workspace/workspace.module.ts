import { Module } from '@nestjs/common';

import { FileUploadService } from 'src/core/file/services/file-upload.service';
import { PipelineModule } from 'src/core/pipeline/pipeline.module';
import { CompanyModule } from 'src/core/company/company.module';
import { PersonModule } from 'src/core/person/person.module';
import { AbilityModule } from 'src/ability/ability.module';
import { PrismaModule } from 'src/database/prisma.module';
import { TenantManagerModule } from 'src/tenant-manager/tenant-manager.module';

import { WorkspaceService } from './services/workspace.service';
import { WorkspaceMemberService } from './services/workspace-member.service';
import { WorkspaceMemberResolver } from './resolvers/workspace-member.resolver';
import { WorkspaceResolver } from './resolvers/workspace.resolver';

@Module({
  imports: [
    AbilityModule,
    PipelineModule,
    CompanyModule,
    PersonModule,
    TenantManagerModule,
    PrismaModule,
  ],
  providers: [
    WorkspaceService,
    FileUploadService,
    WorkspaceMemberService,
    WorkspaceMemberResolver,
    WorkspaceResolver,
  ],
  exports: [WorkspaceService, WorkspaceMemberService],
})
export class WorkspaceModule {}
