import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiModule } from 'src/engine/core-modules/ai/ai.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';

import { RouterService } from './router.service';

@Module({
  imports: [TypeOrmModule.forFeature([AgentEntity, Workspace]), AiModule],
  providers: [RouterService],
  exports: [RouterService],
})
export class RouterModule {}
