import { Module } from '@nestjs/common';

import { CompanyRepository } from 'src/modules/company/repositories/company/company.repository';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [CompanyRepository],
  exports: [CompanyRepository],
})
export class CompanyModule {}
