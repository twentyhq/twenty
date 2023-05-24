import { Module } from '@nestjs/common';
import { PersonModule } from 'src/entities/person/person.module';
import { CompanyModule } from 'src/entities/company/company.module';
import { UserModule } from 'src/entities/user/user.module';
import { WorkspaceModule } from 'src/entities/workspace/workspace.module';
import { PersonResolver } from './resolvers/person.resolver';
import { CompanyResolver } from './resolvers/company.resolver';
import { WorkspaceResolver } from './resolvers/workspace.resolver';

@Module({
  imports: [PersonModule, CompanyModule, UserModule, WorkspaceModule],
  providers: [PersonResolver, CompanyResolver, WorkspaceResolver],
})
export class ApiModule {}
