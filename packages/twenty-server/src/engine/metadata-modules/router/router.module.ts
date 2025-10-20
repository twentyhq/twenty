import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { AgentModule } from 'src/engine/metadata-modules/agent/agent.module';

import { RouterService } from './router.service';

@Module({
  imports: [TypeOrmModule.forFeature([AgentEntity, Workspace]), AgentModule],
  providers: [RouterService, AiModelRegistryService],
  exports: [RouterService],
})
export class RouterModule {}
