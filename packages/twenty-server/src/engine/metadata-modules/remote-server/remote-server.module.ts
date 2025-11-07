import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ForeignDataWrapperServerQueryFactory } from 'src/engine/api/graphql/workspace-query-builder/factories/foreign-data-wrapper-server-query.factory';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RemoteServerEntity } from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { RemoteServerResolver } from 'src/engine/metadata-modules/remote-server/remote-server.resolver';
import { RemoteServerService } from 'src/engine/metadata-modules/remote-server/remote-server.service';
import { RemoteTableModule } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    JwtModule,
    PermissionsModule,
    TypeOrmModule.forFeature([RemoteServerEntity]),
    RemoteTableModule,
    WorkspaceDataSourceModule,
    TypeOrmModule.forFeature([FeatureFlagEntity]),
  ],
  providers: [
    RemoteServerService,
    RemoteServerResolver,
    ForeignDataWrapperServerQueryFactory,
  ],
})
export class RemoteServerModule {}
