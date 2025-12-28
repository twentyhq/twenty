import { Module } from '@nestjs/common';

import { NoteDeleteOnePostQueryHook } from 'src/modules/note/query-hooks/note-delete-one.post-query.hook';
import { NoteRestoreManyPostQueryHook } from 'src/modules/note/query-hooks/note-restore-many.post-query.hook';

@Module({
  providers: [NoteDeleteOnePostQueryHook, NoteRestoreManyPostQueryHook],
})
export class NoteQueryHookModule {}
