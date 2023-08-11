import { Module } from '@nestjs/common';

import { CommentModule } from 'src/core/comment/comment.module';
import { ActivityModule } from 'src/core/activity/activity.module';
import { FileModule } from 'src/core/file/file.module';

import { PersonService } from './person.service';
import { PersonResolver } from './person.resolver';
import { PersonRelationsResolver } from './person-relations.resolver';

@Module({
  imports: [CommentModule, ActivityModule, FileModule],
  providers: [PersonService, PersonResolver, PersonRelationsResolver],
  exports: [PersonService],
})
export class PersonModule {}
