import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiAgentConfig } from 'src/engine/core-modules/ai-agent-config/ai-agent-config.entity';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { NestboxAiAgentRunOnceCommand } from 'src/modules/nestbox-ai-agent/crons/commands/nestbox-ai-agent-run-once.command';
import { NestboxAiAgentCronCommand } from 'src/modules/nestbox-ai-agent/crons/commands/nestbox-ai-agent-start.command';
import { NestboxAiAgentCronStopCommand } from 'src/modules/nestbox-ai-agent/crons/commands/nestbox-ai-agent-stop.command';
import { NestboxAiAgentCronJob } from 'src/modules/nestbox-ai-agent/crons/jobs/nestbox-ai-agent.cron.job';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, AiAgentConfig], 'core'),
    TypeOrmModule.forFeature([ObjectMetadataEntity, DataSourceEntity], 'core'),
    ApiKeyModule,
  ],
  providers: [
    NestboxAiAgentCronCommand,
    NestboxAiAgentCronStopCommand,
    NestboxAiAgentRunOnceCommand,
    NestboxAiAgentCronJob,
  ],
  exports: [],
})
export class NestboxAiAgentModule {}
