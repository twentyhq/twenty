import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { NestboxAiAgentCronJob } from 'src/modules/nestbox-ai-agent/crons/jobs/nestbox-ai-agent.cron.job';

@Command({
  name: 'nestbox-ai:agent:run-once',
  description: 'Manually runs the nestbox AI agent job once for testing',
})
export class NestboxAiAgentRunOnceCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    console.log('🚀 Manually triggering Nestbox AI Agent job once...');
    
    await this.messageQueueService.add(
      NestboxAiAgentCronJob.name,
      {},
    );
    
    console.log('✅ Nestbox AI Agent job has been queued for execution');
  }
} 