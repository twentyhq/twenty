import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AnalyticsService } from './analytics.service';
import { Analytics } from './analytics.entity';
import { CreateAnalyticsInput } from './dto/create-analytics.input';
import { OptionalJwtAuthGuard } from 'src/guards/optional-jwt.auth.guard';
import { UseGuards } from '@nestjs/common';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { User, Workspace } from '@prisma/client';
import { AuthUser } from 'src/decorators/auth-user.decorator';

@UseGuards(OptionalJwtAuthGuard)
@Resolver(() => Analytics)
export class AnalyticsResolver {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Mutation(() => Analytics)
  createEvent(
    @Args() createEventInput: CreateAnalyticsInput,
    @AuthWorkspace() workspace: Workspace | undefined,
    @AuthUser() user: User | undefined,
  ) {
    return this.analyticsService.create(createEventInput, user, workspace);
  }
}
