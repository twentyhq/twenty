import { Module } from '@nestjs/common';

import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';
import { CreateCompanyService } from 'src/workspace/messaging/services/create-company/create-company.service';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [CreateCompanyService],
  exports: [CreateCompanyService],
})
export class CreateCompanyModule {}
