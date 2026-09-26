import { Module } from '@nestjs/common';

import { CallRecordingCreateManyPreQueryHook } from 'src/modules/call-recording/query-hooks/call-recording-create-many.pre-query-hook';
import { CallRecordingCreateOnePreQueryHook } from 'src/modules/call-recording/query-hooks/call-recording-create-one.pre-query-hook';

@Module({
  providers: [
    CallRecordingCreateOnePreQueryHook,
    CallRecordingCreateManyPreQueryHook,
  ],
})
export class CallRecordingQueryHookModule {}
