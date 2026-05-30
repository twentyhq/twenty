import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AiWorkspaceStatsResolver } from 'src/engine/metadata-modules/ai/ai-workspace-stats/resolvers/ai-workspace-stats.resolver';
import { AiWorkspaceStatsService } from 'src/engine/metadata-modules/ai/ai-workspace-stats/services/ai-workspace-stats.service';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { SkillEntity } from 'src/engine/metadata-modules/skill/entities/skill.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgentChatThreadEntity,
      SkillEntity,
      LogicFunctionEntity,
    ]),
    PermissionsModule,
  ],
  providers: [
    AiWorkspaceStatsResolver,
    AiWorkspaceStatsService,
    provideWorkspaceScopedRepository(AgentChatThreadEntity),
    provideWorkspaceScopedRepository(SkillEntity),
  ],
  exports: [AiWorkspaceStatsService],
})
export class AiWorkspaceStatsModule {}
