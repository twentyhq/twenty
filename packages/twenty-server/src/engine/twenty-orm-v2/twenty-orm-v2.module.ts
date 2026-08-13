import { Module } from '@nestjs/common';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { WorkspaceDataSourceV2Service } from 'src/engine/twenty-orm-v2/datasource/workspace-data-source-v2.service';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';

@Module({
  imports: [TwentyConfigModule, WorkspaceEventEmitterModule, TypeORMModule],
  providers: [WorkspaceDataSourceV2Service],
  exports: [WorkspaceDataSourceV2Service],
})
export class TwentyORMV2Module {}
