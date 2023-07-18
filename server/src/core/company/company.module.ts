import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyResolver } from './company.resolver';
import { CompanyRelationsResolver } from './company-relations.resolver';
import { CommentModule } from '../comment/comment.module';

@Module({
  imports: [CommentModule],
  providers: [CompanyService, CompanyResolver, CompanyRelationsResolver],
  exports: [CompanyService],
})
export class CompanyModule {}
