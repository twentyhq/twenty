import { Module } from '@nestjs/common';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ApplicationPackageModule } from 'src/engine/core-modules/application/application-package/application-package.module';
import { WorkspaceFrontComponentDependenciesService } from 'src/engine/metadata-modules/ai/ai-front-component/workspace-front-component-dependencies.service';
import { FrontComponentCompilerService } from 'src/engine/metadata-modules/ai/ai-front-component/front-component-compiler.service';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';
import { AiFrontComponentController } from 'src/engine/metadata-modules/ai/ai-front-component/ai-front-component.controller';
import { AiFrontComponentService } from 'src/engine/metadata-modules/ai/ai-front-component/ai-front-component.service';

@Module({
  imports: [
    TypeORMModule,
    ApplicationModule,
    ApplicationPackageModule,
    CacheLockModule,
    PermissionsModule,
    FeatureFlagModule,
    RecordCrudModule,
  ],
  controllers: [AiFrontComponentController],
  providers: [
    AiFrontComponentService,
    FrontComponentCompilerService,
    WorkspaceFrontComponentDependenciesService,
  ],
})
export class AiFrontComponentModule {}
