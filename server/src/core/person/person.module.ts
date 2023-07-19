import { Module } from '@nestjs/common';

import { CommentModule } from 'src/core/comment/comment.module';

import { PersonService } from './person.service';
import { PersonResolver } from './person.resolver';
import { PersonRelationsResolver } from './person-relations.resolver';

@Module({
  imports: [CommentModule, CommentModule],
  providers: [PersonService, PersonResolver, PersonRelationsResolver],
  exports: [PersonService],
})
export class PersonModule {}
