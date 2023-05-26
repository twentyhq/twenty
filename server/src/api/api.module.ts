import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { PrismaClient } from '@prisma/client';
import { CompanyRelationsResolver } from './generated-graphql';
import { CompanyResolver } from './resolvers/company.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { PeopleResolver } from './resolvers/people.resolver';

import { PersonRelationsResolver } from './resolvers/relations/people-relations.resolver';
import { UserRelationsResolver } from './resolvers/relations/user-relations.resolver';
import { WorkspaceMemberRelationsResolver } from './resolvers/relations/workspace-member-relations.resolver';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
    PrismaModule,
  ],
  providers: [
    PrismaClient,

    CompanyResolver,
    PeopleResolver,
    UserResolver,

    CompanyRelationsResolver,
    PersonRelationsResolver,
    UserRelationsResolver,
    WorkspaceMemberRelationsResolver,
  ],
})
export class ApiModule {}
