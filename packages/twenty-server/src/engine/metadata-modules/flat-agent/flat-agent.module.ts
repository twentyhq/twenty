import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { WorkspaceFlatAgentMapCacheService } from 'src/engine/metadata-modules/flat-agent/services/workspace-flat-agent-map-cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([AgentEntity])],
  providers: [WorkspaceFlatAgentMapCacheService],
  exports: [WorkspaceFlatAgentMapCacheService],
})
export class FlatAgentModule {}

