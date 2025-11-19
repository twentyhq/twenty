import { Module } from '@nestjs/common';

import { MessageFolderUpdateOnePreQueryHook } from 'src/modules/messaging/message-folder-manager/query-hooks/message-folder-update-one.pre-query.hook';

@Module({
  providers: [MessageFolderUpdateOnePreQueryHook],
  exports: [MessageFolderUpdateOnePreQueryHook],
})
export class MessageFolderQueryHookModule {}
