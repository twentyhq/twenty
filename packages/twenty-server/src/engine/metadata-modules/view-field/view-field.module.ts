import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ViewFieldController } from 'src/engine/metadata-modules/view-field/controllers/view-field.controller';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFieldResolver } from 'src/engine/metadata-modules/view-field/resolvers/view-field.resolver';
import { ViewFieldV2Service } from 'src/engine/metadata-modules/view-field/services/view-field-v2.service';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';
import { ViewModule } from 'src/engine/metadata-modules/view/view.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ViewFieldEntity]),
    ViewModule,
    FeatureFlagModule,
    WorkspaceMigrationV2Module,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  controllers: [ViewFieldController],
  providers: [ViewFieldService, ViewFieldResolver, ViewFieldV2Service],
  exports: [ViewFieldService, ViewFieldV2Service],
})
export class ViewFieldModule {}
