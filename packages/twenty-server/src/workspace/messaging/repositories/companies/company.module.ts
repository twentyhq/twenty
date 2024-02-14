import { Module } from '@nestjs/common';

import { CompanyService } from 'src/workspace/messaging/repositories/companies/company.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

// TODO: Move outside of the messaging module
@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
