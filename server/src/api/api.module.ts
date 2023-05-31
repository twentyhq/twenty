import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CompanyResolver } from './resolvers/company.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { PersonResolver } from './resolvers/person.resolver';
import { CommentResolver } from './resolvers/comment.resolver';
import { CommentThreadResolver } from './resolvers/comment-thread.resolver';

import { PersonRelationsResolver } from './resolvers/relations/person-relations.resolver';
import { UserRelationsResolver } from './resolvers/relations/user-relations.resolver';
import { WorkspaceMemberRelationsResolver } from './resolvers/relations/workspace-member-relations.resolver';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { CompanyRelationsResolver } from './resolvers/relations/company-relations.resolver';
import { PrismaModule } from 'src/database/prisma.module';
import { ArgsService } from './resolvers/services/args.service';
import { CommentThreadRelationsResolver } from './resolvers/relations/comment-thread-relations.resolver';

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
    ArgsService,

    CompanyResolver,
    PersonResolver,
    UserResolver,
    CommentResolver,
    CommentThreadResolver,

    CompanyRelationsResolver,
    PersonRelationsResolver,
    UserRelationsResolver,
    WorkspaceMemberRelationsResolver,
    CommentThreadRelationsResolver,
  ],
})
export class ApiModule {}
