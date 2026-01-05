import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FlatSkillModule } from 'src/engine/metadata-modules/flat-skill/flat-skill.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { SkillGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/skill/interceptors/skill-graphql-api-exception.interceptor';
import { SkillResolver } from 'src/engine/metadata-modules/skill/skill.resolver';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';
import { WorkspaceMigrationBuilderGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/workspace-migration-builder-graphql-api-exception.interceptor';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationV2Module,
    ApplicationModule,
    PermissionsModule,
    FlatSkillModule,
  ],
  providers: [
    SkillService,
    SkillResolver,
    SkillGraphqlApiExceptionInterceptor,
    WorkspaceMigrationBuilderGraphqlApiExceptionInterceptor,
  ],
  exports: [SkillService],
})
export class SkillModule {}
