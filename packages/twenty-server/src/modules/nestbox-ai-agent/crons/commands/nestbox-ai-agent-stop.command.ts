import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { NestboxAiAgentCronJob } from 'src/modules/nestbox-ai-agent/crons/jobs/nestbox-ai-agent.cron.job';

@Command({
  name: 'cron:nestbox-ai:agent:stop',
  description: 'Stops the nestbox AI agent cron job',
})
export class NestboxAiAgentCronStopCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.removeCron({
      jobName: NestboxAiAgentCronJob.name,
    });
    
    console.log('✅ Nestbox AI Agent cron job has been stopped successfully');
  }
} 