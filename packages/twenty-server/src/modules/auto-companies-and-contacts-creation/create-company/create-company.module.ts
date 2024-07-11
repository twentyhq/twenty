import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { CreateCompanyService } from 'src/modules/auto-companies-and-contacts-creation/create-company/create-company.service';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([CompanyWorkspaceEntity]),
  ],
  providers: [CreateCompanyService],
  exports: [CreateCompanyService],
})
export class CreateCompanyModule {}
