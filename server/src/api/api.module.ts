import { Module } from '@nestjs/common';
import { TypeGraphQLModule } from 'typegraphql-nestjs';
import { ApolloDriver } from '@nestjs/apollo';
import { PrismaClient } from '@prisma/client';

import {
  CompanyCrudResolver,
  CompanyRelationsResolver,
  UserCrudResolver,
  UserRelationsResolver,
  PersonCrudResolver,
  PersonRelationsResolver,
  WorkspaceCrudResolver,
  WorkspaceRelationsResolver,
  WorkspaceMemberRelationsResolver,
} from '@generated/type-graphql';

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
