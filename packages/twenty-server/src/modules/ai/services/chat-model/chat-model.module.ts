import { Module } from '@nestjs/common';

import { ChatModelService } from 'src/modules/ai/services/chat-model/chat-model.service';

@Module({
  imports: [],
  providers: [ChatModelService],
  exports: [ChatModelService],
})
export class ChatModelModule {}
