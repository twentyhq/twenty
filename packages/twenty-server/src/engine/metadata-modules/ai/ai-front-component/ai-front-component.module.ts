import { FrontComponentSharedDependenciesModule } from 'src/engine/core-modules/application/front-component-shared-dependencies/front-component-shared-dependencies.module';
import { Global, Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationLookupModule } from 'src/engine/core-modules/application/application-lookup/application-lookup.module';
import { ApplicationRegistrationLookupModule } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ApplicationPackageModule } from 'src/engine/core-modules/application/application-package/application-package.module';
import { WorkspaceFrontComponentDependenciesService } from 'src/engine/metadata-modules/ai/ai-front-component/workspace-front-component-dependencies.service';
import { FrontComponentCompilerService } from 'src/engine/metadata-modules/ai/ai-front-component/front-component-compiler.service';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';
import { AI_FRONT_COMPONENT_SERVICE_TOKEN } from 'src/engine/core-modules/tool-provider/constants/ai-front-component-service.token';
import { FrontComponentModule } from 'src/engine/metadata-modules/front-component/front-component.module';
import { AiFrontComponentController } from 'src/engine/metadata-modules/ai/ai-front-component/ai-front-component.controller';
import { AiFrontComponentService } from 'src/engine/metadata-modules/ai/ai-front-component/ai-front-component.service';

@Global()
@Module({
  imports: [
    ApplicationModule,
    FrontComponentSharedDependenciesModule,
    ApplicationPackageModule,
    CacheLockModule,
    PermissionsModule,
    ApplicationLookupModule,
    ApplicationRegistrationLookupModule,
    FeatureFlagModule,
    RecordCrudModule,
    FrontComponentModule,
  ],
  controllers: [AiFrontComponentController],
  providers: [
    AiFrontComponentService,
    FrontComponentCompilerService,
    WorkspaceFrontComponentDependenciesService,
    {
      provide: AI_FRONT_COMPONENT_SERVICE_TOKEN,
      useExisting: AiFrontComponentService,
    },
  ],
  exports: [AI_FRONT_COMPONENT_SERVICE_TOKEN],
})
export class AiFrontComponentModule {}
