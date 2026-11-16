import { Injectable } from '@nestjs/common';

import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { type AgentInboxCallerAuthContext } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-inbox-caller-auth-context.type';

@Injectable()
export class AgentInboxAccessService {
  constructor(private readonly sharingService: AgentChatSharingService) {}

  async assertThreadIsWritableOrThrow({
    authContext,
    threadId,
  }: {
    authContext: AgentInboxCallerAuthContext;
    threadId: string;
  }): Promise<void> {
    await this.sharingService.getCallerWritableThreadOrThrow({
      authContext,
      threadId,
    });
  }
}
