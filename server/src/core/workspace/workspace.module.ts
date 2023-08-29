import { Module } from '@nestjs/common';

import { FileUploadService } from 'src/core/file/services/file-upload.service';
import { PipelineModule } from 'src/core/pipeline/pipeline.module';
import { CompanyModule } from 'src/core/company/company.module';
import { PersonModule } from 'src/core/person/person.module';
import { ViewModule } from 'src/core/view/view.module';
import { DataSourceModule } from 'src/core/tenant/datasource/datasource.module';

import { WorkspaceService } from './services/workspace.service';
import { WorkspaceMemberService } from './services/workspace-member.service';
import { WorkspaceMemberResolver } from './resolvers/workspace-member.resolver';
import { WorkspaceResolver } from './resolvers/workspace.resolver';

@Module({
  imports: [
    PipelineModule,
    CompanyModule,
    PersonModule,
    ViewModule,
    DataSourceModule,
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
