import { Resolver, ResolveField, Root, Int } from '@nestjs/graphql';

import { Comment } from 'src/core/@generated/comment/comment.model';
import { Company } from 'src/core/@generated/company/company.model';
import { CommentService } from 'src/core/comment/comment.service';
import {
  PrismaSelect,
  PrismaSelector,
} from 'src/decorators/prisma-select.decorator';
import { ActivityService } from 'src/core/activity/services/activity.service';
import { Activity } from 'src/core/@generated/activity/activity.model';

@Resolver(() => Company)
export class CompanyRelationsResolver {
  constructor(
    private readonly activityService: ActivityService,
    private readonly commentService: CommentService,
  ) {}

  @ResolveField(() => [Activity], {
    nullable: false,
  })
  async activities(
    @Root() company: Company,
    @PrismaSelector({ modelName: 'Activity' })
    prismaSelect: PrismaSelect<'Activity'>,
  ): Promise<Partial<Activity>[]> {
    return this.activityService.findMany({
      where: {
        activityTargets: {
          some: {
            companyId: company.id,
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
    @Root() company: Company,
    @PrismaSelector({ modelName: 'Comment' })
    prismaSelect: PrismaSelect<'Comment'>,
  ): Promise<Partial<Comment>[]> {
    return this.commentService.findMany({
      where: {
        activity: {
          activityTargets: {
            some: {
              companyId: company.id,
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
  async _activityCount(@Root() company: Company): Promise<number> {
    return this.activityService.count({
      where: {
        activityTargets: {
          some: {
            companyId: company.id,
          },
        },
      },
    });
  }
}
