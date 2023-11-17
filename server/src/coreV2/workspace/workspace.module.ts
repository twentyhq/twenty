import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { WorkspaceResolver } from 'src/coreV2/workspace/workspace.resolver';
import { FileModule } from 'src/core/file/file.module';
import { AbilityModule } from 'src/ability/ability.module';
import { WorkspaceManagerModule } from 'src/workspace/workspace-manager/workspace-manager.module';

import { Workspace } from './workspace.entity';
import { workspaceAutoResolverOpts } from './workspace.auto-resolver-opts';

import { WorkspaceService } from './services/workspace.service';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([Workspace]),
        WorkspaceManagerModule,
        FileModule,
        AbilityModule,
      ],
      services: [WorkspaceService],
      resolvers: workspaceAutoResolverOpts,
    }),
  ],
  providers: [WorkspaceResolver],
})
export class WorkspaceModule {}
