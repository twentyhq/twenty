import { Module } from '@nestjs/common';
import { PersonService } from './person.service';
import { PersonResolver } from './person.resolver';
import { PersonRelationsResolver } from './person-relations.resolver';
import { CommentModule } from '../comment/comment.module';

@Module({
  imports: [CommentModule, CommentModule],
  providers: [PersonService, PersonResolver, PersonRelationsResolver],
  exports: [PersonService],
})
export class PersonModule {}
