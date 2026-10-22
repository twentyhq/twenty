import { FrontComponentCompilerService } from 'src/engine/metadata-modules/ai/ai-front-component/front-component-compiler.service';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationLookupModule } from 'src/engine/core-modules/application/application-lookup/application-lookup.module';
import { ApplicationRegistrationLookupModule } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';
import { AI_FRONT_COMPONENT_SERVICE_TOKEN } from 'src/engine/core-modules/tool-provider/constants/ai-front-component-service.token';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FrontComponentModule } from 'src/engine/metadata-modules/front-component/front-component.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { AiFrontComponentController } from 'src/engine/metadata-modules/ai/ai-front-component/ai-front-component.controller';
import { AiFrontComponentService } from 'src/engine/metadata-modules/ai/ai-front-component/ai-front-component.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([FrontComponentEntity]),
    ApplicationModule,
    ApplicationLookupModule,
    ApplicationRegistrationLookupModule,
    CacheLockModule,
    FeatureFlagModule,
    RecordCrudModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    FrontComponentModule,
    PermissionsModule,
  ],
  controllers: [AiFrontComponentController],
  providers: [
    provideWorkspaceScopedRepository(FrontComponentEntity),
    AiFrontComponentService,
    FrontComponentCompilerService,
    {
      provide: AI_FRONT_COMPONENT_SERVICE_TOKEN,
      useExisting: AiFrontComponentService,
    },
  ],
  exports: [AI_FRONT_COMPONENT_SERVICE_TOKEN],
})
export class AiFrontComponentModule {}
