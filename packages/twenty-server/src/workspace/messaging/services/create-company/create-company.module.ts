import { Module } from '@nestjs/common';

import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';
import { CreateCompanyService } from 'src/workspace/messaging/services/create-company/create-company.service';
import { CompanyModule } from 'src/workspace/messaging/repositories/company/company.module';

@Module({
  imports: [WorkspaceDataSourceModule, CompanyModule],
  providers: [CreateCompanyService],
  exports: [CreateCompanyService],
})
export class CreateCompanyModule {}
