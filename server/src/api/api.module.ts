import { Module } from '@nestjs/common';
import { TypeGraphQLModule } from 'typegraphql-nestjs';
import { ApolloDriver } from '@nestjs/apollo';
import { PrismaClient } from '@prisma/client';

import { CompanyCrudResolver } from './graphql/resolvers/crud/Company/CompanyCrudResolver';
import { CompanyRelationsResolver } from './graphql/resolvers/relations/Company/CompanyRelationsResolver';
import { UserCrudResolver } from './graphql/resolvers/crud/User/UserCrudResolver';
import { UserRelationsResolver } from './graphql/resolvers/relations/User/UserRelationsResolver';
import { PersonCrudResolver } from './graphql/resolvers/crud/Person/PersonCrudResolver';
import { PersonRelationsResolver } from './graphql/resolvers/relations/Person/PersonRelationsResolver';
import { WorkspaceCrudResolver } from './graphql/resolvers/crud/Workspace/WorkspaceCrudResolver';
import { WorkspaceRelationsResolver } from './graphql/resolvers/relations/Workspace/WorkspaceRelationsResolver';
import { WorkspaceMemberRelationsResolver } from './graphql/resolvers/relations/WorkspaceMember/WorkspaceMemberRelationsResolver';

interface Context {
  prisma: PrismaClient;
}

const prisma = new PrismaClient();

@Module({
  imports: [
    TypeGraphQLModule.forRoot({
      driver: ApolloDriver,
      path: '/',
      validate: false,
      context: (): Context => ({ prisma }),
    }),
  ],
  providers: [
    CompanyCrudResolver,
    CompanyRelationsResolver,
    UserCrudResolver,
    UserRelationsResolver,
    PersonCrudResolver,
    PersonRelationsResolver,
    WorkspaceCrudResolver,
    WorkspaceRelationsResolver,
    WorkspaceMemberRelationsResolver,
  ],
})
export class ApiModule {}
