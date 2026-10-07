import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { WorkspaceFlatApplicationVariableMapCacheService } from 'src/engine/metadata-modules/flat-application-variable/services/workspace-flat-application-variable-map-cache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity, ApplicationVariableEntity]),
  ],
  providers: [WorkspaceFlatApplicationVariableMapCacheService],
  exports: [WorkspaceFlatApplicationVariableMapCacheService],
})
export class FlatApplicationVariableModule {}
