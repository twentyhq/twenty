import { Command, CommandRunner, Option } from 'nest-commander';

import { MessagingProducer } from 'src/workspace/messaging/producers/messaging-producer';

interface FetchWorkspaceMessagesOptions {
  workspaceId: string;
}

@Command({
  name: 'workspace:fetch-messages',
  description: 'Fetch messages of all workspaceMembers in a workspace.',
})
export class FetchWorkspaceMessagesCommand extends CommandRunner {
  constructor(private readonly messagingProducer: MessagingProducer) {
    super();
  }

  async run(
    _passedParam: string[],
    options: FetchWorkspaceMessagesOptions,
  ): Promise<void> {
    await this.messagingProducer.enqueueFetchMessages(
      { workspaceId: options.workspaceId },
      options.workspaceId,
    );

    return;
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }
}
