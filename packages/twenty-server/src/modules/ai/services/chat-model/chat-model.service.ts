import { Injectable } from '@nestjs/common';

import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatOpenAI } from '@langchain/openai';
import { ChatMistralAI } from '@langchain/mistralai';

@Injectable()
export class ChatModelService {
  private chatModel: BaseChatModel | undefined;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.chatModel = new ChatOpenAI({
        model: 'gpt-4o',
      });
    } else if (process.env.MISTRAL_API_KEY) {
      // Not tested yet
      this.chatModel = new ChatMistralAI({
        model: 'mistral-large-latest',
      });
    }
  }

  public getChatModel() {
    if (!this.chatModel) {
      throw new Error('No credentials configured for any ChatModel');
    }

    return this.chatModel;
  }
}
