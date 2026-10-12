import { Module } from '@nestjs/common';

import { WorkspaceFlatApplicationVariableMapCacheService } from 'src/engine/metadata-modules/flat-application-variable/services/workspace-flat-application-variable-map-cache.service';

@Module({
  providers: [WorkspaceFlatApplicationVariableMapCacheService],
})
export class FlatApplicationVariableModule {}
