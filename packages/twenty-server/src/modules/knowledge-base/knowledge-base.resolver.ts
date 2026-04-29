import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { KnowledgeBaseService } from './knowledge-base.service';

// --- DTOs ---
@ObjectType()
class KBCategoryDTO {
  @Field() id: string;
  @Field() name: string;
  @Field({ nullable: true }) parentCategoryId?: string;
}

@ObjectType()
class KBArticleDTO {
  @Field() id: string;
  @Field() title: string;
  @Field({ nullable: true }) status?: string;
  @Field(() => Int, { nullable: true }) viewCount?: number;
  @Field(() => Int, { nullable: true }) helpfulCount?: number;
}

@InputType()
class CreateArticleInput {
  @Field() title: string;
  @Field() content: string;
  @Field({ nullable: true }) categoryId?: string;
  @Field({ nullable: true }) authorId?: string;
  @Field(() => [String], { nullable: true }) tags?: string[];
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class KnowledgeBaseResolver {
  constructor(private readonly service: KnowledgeBaseService) {}

  @Mutation(() => KBCategoryDTO)
  async createKBCategory(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('name') name: string,
    @Args('parentCategoryId', { nullable: true }) parentCategoryId?: string,
  ) {
    return this.service.createCategory(workspace.id, name, parentCategoryId);
  }

  @Mutation(() => KBArticleDTO)
  async createArticle(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateArticleInput,
  ) {
    return this.service.createArticle(workspace.id, input);
  }

  @Mutation(() => KBArticleDTO)
  async publishArticle(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('articleId') articleId: string,
  ) {
    return this.service.publishArticle(articleId);
  }

  @Query(() => [KBArticleDTO])
  async searchArticles(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('query') query: string,
  ) {
    return this.service.searchArticles(workspace.id, query);
  }

  @Query(() => [KBArticleDTO])
  async suggestArticlesForTicket(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('ticketSubject') ticketSubject: string,
  ) {
    return this.service.suggestForTicket(workspace.id, ticketSubject);
  }

  @Query(() => Int)
  async getDeflectionRate(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getDeflectionRate(workspace.id);
  }
}
