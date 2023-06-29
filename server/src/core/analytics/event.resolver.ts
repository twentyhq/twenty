import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { EventService } from './event.service';
import { Event } from './event.entity';
import { CreateEventInput } from './dto/create-event.input';
import { OptionalJwtAuthGuard } from 'src/guards/optional-jwt.auth.guard';
import { UseGuards } from '@nestjs/common';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { User, Workspace } from '@prisma/client';
import { AuthUser } from 'src/decorators/auth-user.decorator';

@UseGuards(OptionalJwtAuthGuard)
@Resolver(() => Event)
export class EventResolver {
  constructor(private readonly eventService: EventService) {}

  @Mutation(() => Event)
  createEvent(
    @Args() createEventInput: CreateEventInput,
    @AuthWorkspace() workspace: Workspace | undefined,
    @AuthUser() user: User | undefined,
  ) {
    return this.eventService.create(createEventInput, user, workspace);
  }
}
