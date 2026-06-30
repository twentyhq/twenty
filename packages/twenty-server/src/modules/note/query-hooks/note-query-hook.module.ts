import { Module } from '@nestjs/common';

import { NoteDeleteManyPostQueryHook } from 'src/modules/note/query-hooks/note-delete-many.post-query.hook';
import { NoteDeleteOnePostQueryHook } from 'src/modules/note/query-hooks/note-delete-one.post-query.hook';
import { NotePostQueryHookService } from 'src/modules/note/query-hooks/note-post-query-hook.service';
import { NoteRestoreManyPostQueryHook } from 'src/modules/note/query-hooks/note-restore-many.post-query.hook';
import { NoteRestoreOnePostQueryHook } from 'src/modules/note/query-hooks/note-restore-one.post-query.hook';

@Module({
  providers: [
    NotePostQueryHookService,
    NoteDeleteManyPostQueryHook,
    NoteDeleteOnePostQueryHook,
    NoteRestoreManyPostQueryHook,
    NoteRestoreOnePostQueryHook,
  ],
})
export class NoteQueryHookModule {}
