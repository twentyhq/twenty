import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationTranslationCatalogModule } from 'src/engine/metadata-modules/application-translation-catalog/application-translation-catalog.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FlatSkillModule } from 'src/engine/metadata-modules/flat-skill/flat-skill.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { SkillResolver } from 'src/engine/metadata-modules/skill/skill.resolver';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { ApplicationLookupModule } from 'src/engine/core-modules/application/application-lookup/application-lookup.module';
import { ApplicationRegistrationLookupModule } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.module';

@Module({
  imports: [
    ApplicationLookupModule,
    ApplicationRegistrationLookupModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
    ApplicationModule,
    ApplicationTranslationCatalogModule,
    PermissionsModule,
    FlatSkillModule,
  ],
  providers: [SkillService, SkillResolver],
  exports: [SkillService],
})
export class SkillModule {}
