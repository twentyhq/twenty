import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CompanyResolver } from './resolvers/company.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { PersonResolver } from './resolvers/person.resolver';

import { PersonRelationsResolver } from './resolvers/relations/person-relations.resolver';
import { UserRelationsResolver } from './resolvers/relations/user-relations.resolver';
import { WorkspaceMemberRelationsResolver } from './resolvers/relations/workspace-member-relations.resolver';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { CompanyRelationsResolver } from './resolvers/relations/company-relations.resolver';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      context: ({ req }) => ({ req }),
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
    AuthModule,
    PrismaModule,
  ],
  providers: [
    ConfigService,

    CompanyResolver,
    PersonResolver,
    UserResolver,

    CompanyRelationsResolver,
    PersonRelationsResolver,
    UserRelationsResolver,
    WorkspaceMemberRelationsResolver,
  ],
})
export class ApiModule {}
