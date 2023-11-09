import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { Workspace } from './workspace.entity';
import { workspaceAutoResolverOpts } from './workspace.auto-resolver-opts';

import { WorkspaceService } from './services/workspace.service';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([Workspace])],
      services: [WorkspaceService],
      resolvers: workspaceAutoResolverOpts,
    }),
  ],
})
export class WorkspaceModule {}
