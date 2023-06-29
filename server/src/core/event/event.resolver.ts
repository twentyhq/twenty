import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { EventService } from './event.service';
import { Event } from './event.entity';
import { CreateEventInput } from './dto/create-event.input';
import axios from 'axios';
import { OptionalJwtAuthGuard } from 'src/guards/optional-jwt.auth.guard';
import { UseGuards } from '@nestjs/common';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { User, Workspace } from '@prisma/client';
import { AuthUser } from 'src/decorators/auth-user.decorator';
import { anonymize } from 'src/utils/anonymize';
import { HttpService } from '@nestjs/axios';

@UseGuards(OptionalJwtAuthGuard)
@Resolver(() => Event)
export class EventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly httpService: HttpService,
  ) {}

  @Mutation(() => Event)
  createEvent(
    @Args() createEventInput: CreateEventInput,
    @AuthWorkspace() workspace: Workspace | undefined,
    @AuthUser() user: User | undefined,
  ) {
    if (process.env.IS_TELEMETRY_ENABLED === 'false') {
      return;
    }

    const data = {
      type: createEventInput.type,
      data: {
        userUUID: user ? anonymize(user.id) : undefined,
        workspaceUUID: workspace ? anonymize(workspace.id) : undefined,
        workspaceDomain: workspace ? workspace.domainName : undefined,
        ...createEventInput.data,
      },
    };

    this.httpService
      .post('https://t.twenty.com/api/v1/s2s/event', data, {
        headers: {
          'X-Auth-Token': 's2s.gs61um40nzhw7mh56uw1ft.4t4u3ku9ueu14cfg08yx91k',
        },
      })
      .subscribe({
        // Non-breaking behavior,
        // So no need to log this unless you're debugging this code specifically
        error: (err) => err, // console.error('HTTP request failed:', error);
      });

    return this.eventService.create(createEventInput);
  }
}
