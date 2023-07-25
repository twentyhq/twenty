import { Resolver, Root, ResolveField, Int } from '@nestjs/graphql';

import { Comment } from 'src/core/@generated/comment/comment.model';
import { Person } from 'src/core/@generated/person/person.model';
import { CommentService } from 'src/core/comment/comment.service';
import {
  PrismaSelect,
  PrismaSelector,
} from 'src/decorators/prisma-select.decorator';
import { Activity } from 'src/core/@generated/activity/activity.model';
import { ActivityService } from 'src/core/activity/services/activity.service';

@Resolver(() => Person)
export class PersonRelationsResolver {
  constructor(
    private readonly activityService: ActivityService,
    private readonly commentService: CommentService,
  ) {}

  @ResolveField(() => [Activity], {
    nullable: false,
  })
  async activities(
    @Root() person: Person,
    @PrismaSelector({ modelName: 'Activity' })
    prismaSelect: PrismaSelect<'Activity'>,
  ): Promise<Partial<Activity>[]> {
    return await this.activityService.findMany({
      where: {
        activityTargets: {
          some: {
            personId: person.id,
          },
        },
      },
      select: prismaSelect.value,
    });
  }

  @ResolveField(() => [Comment], {
    nullable: false,
  })
  async comments(
    @Root() person: Person,
    @PrismaSelector({ modelName: 'Comment' })
    prismaSelect: PrismaSelect<'Comment'>,
  ): Promise<Partial<Comment>[]> {
    return this.commentService.findMany({
      where: {
        activity: {
          activityTargets: {
            some: {
              personId: person.id,
            },
          },
        },
      },
      select: prismaSelect.value,
    });
  }

  @ResolveField(() => Int, {
    nullable: false,
  })
  async _activityCount(@Root() person: Person): Promise<number> {
    return this.activityService.count({
      where: {
        activityTargets: {
          some: {
            personId: person.id,
          },
        },
      },
    });
  }
}
