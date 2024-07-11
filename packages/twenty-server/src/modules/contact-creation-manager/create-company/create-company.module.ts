import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { CreateCompanyService } from 'src/modules/contact-creation-manager/create-company/create-company.service';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([CompanyWorkspaceEntity]),
  ],
  providers: [CreateCompanyService],
  exports: [CreateCompanyService],
})
export class CreateCompanyModule {}
