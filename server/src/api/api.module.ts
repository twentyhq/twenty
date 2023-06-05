import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigService } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/database/prisma.module';
import { ArgsService } from './resolvers/services/args.service';

import { CompanyResolver } from './resolvers/company.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { PersonResolver } from './resolvers/person.resolver';
import { CommentResolver } from './resolvers/comment.resolver';
import { CommentThreadResolver } from './resolvers/comment-thread.resolver';
import { PipelineResolver } from './resolvers/pipeline.resolver';
import { PipelineStageResolver } from './resolvers/pipeline-stage.resolver';

import { PersonRelationsResolver } from './resolvers/relations/person-relations.resolver';
import { UserRelationsResolver } from './resolvers/relations/user-relations.resolver';
import { WorkspaceMemberRelationsResolver } from './resolvers/relations/workspace-member-relations.resolver';
import { CompanyRelationsResolver } from './resolvers/relations/company-relations.resolver';
import { CommentThreadRelationsResolver } from './resolvers/relations/comment-thread-relations.resolver';
import { PipelineRelationsResolver } from './resolvers/relations/pipeline-relations.resolver';
import { PipelineStageRelationsResolver } from './resolvers/relations/pipeline-stage-relations.resolver';
import { GraphQLError } from 'graphql';
import { CommentRelationsResolver } from './resolvers/relations/comment-relations.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      context: ({ req }) => ({ req }),
      driver: ApolloDriver,
      autoSchemaFile: true,
      formatError: (error: GraphQLError) => {
        error.extensions.stacktrace = undefined;
        return error;
      },
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
    PipelineResolver,
    PipelineStageResolver,

    CompanyRelationsResolver,
    CommentRelationsResolver,
    PersonRelationsResolver,
    UserRelationsResolver,
    WorkspaceMemberRelationsResolver,
    CommentThreadRelationsResolver,
    PipelineRelationsResolver,
    PipelineStageRelationsResolver,
  ],
})
export class ApiModule {}
