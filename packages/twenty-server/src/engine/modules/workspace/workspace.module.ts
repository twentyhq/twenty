import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { FileModule } from 'src/engine/modules/file/file.module';
import { WorkspaceManagerModule } from 'src/engine/workspace-manager/workspace-manager.module';
import { WorkspaceResolver } from 'src/engine/modules/workspace/workspace.resolver';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FeatureFlagEntity } from 'src/engine/modules/feature-flag/feature-flag.entity';
import { UserWorkspace } from 'src/engine/modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/modules/user/user.entity';
import { UserWorkspaceModule } from 'src/engine/modules/user-workspace/user-workspace.module';
import { BillingModule } from 'src/engine/modules/billing/billing.module';

import { Workspace } from './workspace.entity';
import { workspaceAutoResolverOpts } from './workspace.auto-resolver-opts';

import { WorkspaceService } from './services/workspace.service';

@Module({
  imports: [
    TypeORMModule,
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        BillingModule,
        FileModule,
        NestjsQueryTypeOrmModule.forFeature(
          [User, Workspace, UserWorkspace, FeatureFlagEntity],
          'core',
        ),
        UserWorkspaceModule,
        WorkspaceManagerModule,
      ],
      services: [WorkspaceService],
      resolvers: workspaceAutoResolverOpts,
    }),
  ],
  exports: [WorkspaceService],
  providers: [WorkspaceResolver, WorkspaceService],
})
export class WorkspaceModule {}
