import { Injectable } from '@nestjs/common';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { FetchBatchMessagesService } from 'src/workspace/messaging/services/fetch-batch-messages.service';
import { GmailClientProvider } from 'src/workspace/messaging/providers/gmail/gmail-client.provider';

@Injectable()
export class GmailPartialSync {
  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly fetchBatchMessagesService: FetchBatchMessagesService,
  ) {}
}
