import { Module } from '@nestjs/common';

import { NoteDeleteOnePostQueryHook } from 'src/modules/note/query-hooks/note-delete-one.post-query.hook';

@Module({
  providers: [NoteDeleteOnePostQueryHook],
})
export class NoteQueryHookModule {}
