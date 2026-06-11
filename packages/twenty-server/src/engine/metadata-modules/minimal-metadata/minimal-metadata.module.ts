import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { MinimalMetadataResolver } from 'src/engine/metadata-modules/minimal-metadata/minimal-metadata.resolver';
import { MinimalMetadataService } from 'src/engine/metadata-modules/minimal-metadata/minimal-metadata.service';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { PropelNavFilterService } from 'src/modules/propel-rls/propel-nav-filter.service';

@Module({
  imports: [
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceCacheModule,
    // Propel: role lookup for the nav-hash salting (propel-nav-filter).
    UserRoleModule,
  ],
  providers: [
    MinimalMetadataResolver,
    MinimalMetadataService,
    // Propel: provided here directly (flat DI graph, same as the nav module).
    PropelNavFilterService,
  ],
  exports: [MinimalMetadataService],
})
export class MinimalMetadataModule {}
