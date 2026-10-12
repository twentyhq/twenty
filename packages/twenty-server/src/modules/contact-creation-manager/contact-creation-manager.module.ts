import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CreateCompanyAndPersonService } from 'src/modules/contact-creation-manager/services/create-company-and-contact.service';
import { CreateCompanyService } from 'src/modules/contact-creation-manager/services/create-company.service';
import { CreatePersonService } from 'src/modules/contact-creation-manager/services/create-person.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserWorkspaceEntity, WorkspaceEntity]),
    SecureHttpClientModule,
  ],
  providers: [
    CreateCompanyService,
    CreatePersonService,
    CreateCompanyAndPersonService,
  ],
  exports: [CreateCompanyAndPersonService],
})
export class ContactCreationManagerModule {}
