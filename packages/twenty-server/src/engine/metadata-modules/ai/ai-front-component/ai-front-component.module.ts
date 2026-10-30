import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationLookupModule } from 'src/engine/core-modules/application/application-lookup/application-lookup.module';
import { ApplicationRegistrationLookupModule } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';
import { FrontComponentModule } from 'src/engine/metadata-modules/front-component/front-component.module';
import { AiFrontComponentController } from 'src/engine/metadata-modules/ai/ai-front-component/ai-front-component.controller';
import { AiFrontComponentService } from 'src/engine/metadata-modules/ai/ai-front-component/ai-front-component.service';
import { AiFrontComponentResolver } from 'src/engine/metadata-modules/ai/ai-front-component/ai-front-component.resolver';

@Module({
  imports: [
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ApplicationModule,
    ApplicationLookupModule,
    ApplicationRegistrationLookupModule,
    FeatureFlagModule,
    RecordCrudModule,
    FrontComponentModule,
  ],
  controllers: [AiFrontComponentController],
  providers: [AiFrontComponentService, AiFrontComponentResolver],
})
export class AiFrontComponentModule {}
