import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { WorkspaceFlatAgentMapCacheService } from 'src/engine/metadata-modules/flat-agent/services/workspace-flat-agent-map-cache.service';
import { WorkspaceFlatRoleTargetByAgentIdService } from 'src/engine/metadata-modules/flat-agent/services/workspace-flat-role-target-by-agent-id.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgentEntity,
      ApplicationEntity,
      RoleEntity,
      RoleTargetEntity,
    ]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    WorkspaceFlatAgentMapCacheService,
    WorkspaceFlatRoleTargetByAgentIdService,
  ],
  exports: [
    WorkspaceFlatAgentMapCacheService,
    WorkspaceFlatRoleTargetByAgentIdService,
  ],
})
export class FlatAgentModule {}
