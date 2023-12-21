import { Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { FetchMessagesJob } from 'src/workspace/messaging/jobs/fetch-messages.job';

@Module({
  providers: [
    {
      provide: FetchMessagesJob.name,
      useClass: FetchMessagesJob,
    },
  ],
})
export class JobsModule {
  static moduleRef: ModuleRef;

  constructor(private moduleRef: ModuleRef) {
    JobsModule.moduleRef = this.moduleRef;
  }
}
