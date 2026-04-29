import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { SupportTicketService } from './support-ticket.service';

// --- DTOs ---
@ObjectType()
class SupportTicketDTO {
  @Field() id: string;
  @Field({ nullable: true }) subject?: string;
  @Field({ nullable: true }) status?: string;
  @Field({ nullable: true }) priority?: string;
  @Field({ nullable: true }) assigneeId?: string;
  @Field({ nullable: true }) resolvedAt?: Date;
  @Field(() => Int, { nullable: true }) csatScore?: number;
}

@ObjectType()
class TicketCommentDTO {
  @Field() id: string;
  @Field() ticketId: string;
  @Field() authorId: string;
  @Field() body: string;
  @Field() isInternal: boolean;
}

@ObjectType()
class TicketMetricsDTO {
  @Field(() => Int) open: number;
  @Field(() => Int) avgFirstResponse: number;
  @Field(() => Int) avgResolution: number;
  @Field(() => Float) csat: number;
  @Field(() => Float) fcrRate: number;
}

@InputType()
class CreateTicketInput {
  @Field() subject: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) priority?: string;
  @Field({ nullable: true }) channel?: string;
  @Field({ nullable: true }) category?: string;
  @Field({ nullable: true }) accountId?: string;
  @Field({ nullable: true }) contactId?: string;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class SupportTicketResolver {
  constructor(private readonly service: SupportTicketService) {}

  @Mutation(() => SupportTicketDTO)
  async createTicket(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateTicketInput,
  ) {
    return this.service.createTicket(workspace.id, input as any);
  }

  @Mutation(() => SupportTicketDTO)
  async assignTicket(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('ticketId') ticketId: string,
    @Args('assigneeId') assigneeId: string,
  ) {
    return this.service.assignTicket(ticketId, assigneeId);
  }

  @Mutation(() => SupportTicketDTO)
  async escalateTicket(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('ticketId') ticketId: string,
    @Args('reason') reason: string,
  ) {
    return this.service.escalateTicket(ticketId, reason);
  }

  @Mutation(() => SupportTicketDTO)
  async resolveTicket(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('ticketId') ticketId: string,
  ) {
    return this.service.resolveTicket(ticketId);
  }

  @Mutation(() => TicketCommentDTO)
  async addTicketComment(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('ticketId') ticketId: string,
    @Args('authorId') authorId: string,
    @Args('body') body: string,
    @Args('isInternal', { defaultValue: false }) isInternal: boolean,
  ) {
    return this.service.addComment(ticketId, authorId, body, isInternal);
  }

  @Query(() => [SupportTicketDTO])
  async checkSLABreaches(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.checkSLABreaches(workspace.id);
  }

  @Mutation(() => SupportTicketDTO)
  async submitCSAT(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('ticketId') ticketId: string,
    @Args('score', { type: () => Int }) score: number,
    @Args('feedback', { nullable: true }) feedback?: string,
  ) {
    return this.service.submitCSAT(ticketId, score, feedback);
  }

  @Query(() => TicketMetricsDTO)
  async getTicketMetrics(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getMetrics(workspace.id);
  }
}
