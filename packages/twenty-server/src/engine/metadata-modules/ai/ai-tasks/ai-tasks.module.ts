import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { AiActionsModule } from 'src/engine/metadata-modules/ai/ai-actions/ai-actions.module';
import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { AiModelsModule } from 'src/engine/metadata-modules/ai/ai-models/ai-models.module';
import { SetuAiTaskDispatcherCronCommand } from 'src/engine/metadata-modules/ai/ai-tasks/crons/commands/setu-ai-task-dispatcher.cron.command';
import { SetuAiTaskDispatcherCronJob } from 'src/engine/metadata-modules/ai/ai-tasks/crons/jobs/setu-ai-task-dispatcher.cron.job';
import { SetuAiTaskRunEntity } from 'src/engine/metadata-modules/ai/ai-tasks/entities/setu-ai-task-run.entity';
import { SetuAiTaskStepEntity } from 'src/engine/metadata-modules/ai/ai-tasks/entities/setu-ai-task-step.entity';
import { RunSetuAiTaskStepJob } from 'src/engine/metadata-modules/ai/ai-tasks/jobs/run-setu-ai-task-step.job';
import { SetuAiTaskResolver } from 'src/engine/metadata-modules/ai/ai-tasks/resolvers/setu-ai-task.resolver';
import { OpenAiResearchRunnerService } from 'src/engine/metadata-modules/ai/ai-tasks/services/openai-research-runner.service';
import { SetuAiResearchContextService } from 'src/engine/metadata-modules/ai/ai-tasks/services/setu-ai-research-context.service';
import { SetuAiResearchNoteService } from 'src/engine/metadata-modules/ai/ai-tasks/services/setu-ai-research-note.service';
import { SetuAiTaskChatToolsService } from 'src/engine/metadata-modules/ai/ai-tasks/services/setu-ai-task-chat-tools.service';
import { SetuAiTaskDispatcherService } from 'src/engine/metadata-modules/ai/ai-tasks/services/setu-ai-task-dispatcher.service';
import { SetuAiTaskExecutionService } from 'src/engine/metadata-modules/ai/ai-tasks/services/setu-ai-task-execution.service';
import { SetuAiTaskLedgerService } from 'src/engine/metadata-modules/ai/ai-tasks/services/setu-ai-task-ledger.service';
import { SetuAiTaskService } from 'src/engine/metadata-modules/ai/ai-tasks/services/setu-ai-task.service';
import { SetuAiTaskGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/ai-tasks/setu-ai-task-graphql-api-exception.interceptor';

// Durable background research started from chat. The chat only receives the
// two task tools; the OpenAI Agents SDK runs here, in the worker, behind the
// research runner adapter.
@Module({
  imports: [
    TypeOrmModule.forFeature([SetuAiTaskRunEntity, SetuAiTaskStepEntity]),
    AiActionsModule,
    AiBillingModule,
    AiModelsModule,
    FeatureFlagModule,
    RecordCrudModule,
    UserWorkspaceModule,
  ],
  providers: [
    OpenAiResearchRunnerService,
    SetuAiResearchContextService,
    SetuAiResearchNoteService,
    SetuAiTaskChatToolsService,
    SetuAiTaskDispatcherService,
    SetuAiTaskExecutionService,
    SetuAiTaskLedgerService,
    SetuAiTaskService,
    RunSetuAiTaskStepJob,
    SetuAiTaskDispatcherCronJob,
    SetuAiTaskDispatcherCronCommand,
    SetuAiTaskResolver,
    SetuAiTaskGraphqlApiExceptionInterceptor,
  ],
  exports: [SetuAiTaskChatToolsService, SetuAiTaskDispatcherCronCommand],
})
export class AiTasksModule {}
