import { Module } from '@nestjs/common';

import { CompanyService } from 'src/modules/messaging/repositories/company/company.service';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

// TODO: Move outside of the messaging module
@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
