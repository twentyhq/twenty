import { Args, Query, Resolver } from '@nestjs/graphql';

import { CustomEntity } from './custom.entity';

import { FindManyCustomArgs } from './args/find-many-custom.args';
import { FindUniqueCustomArgs } from './args/find-unique-custom.args';
import { UpdateOneCustomArgs } from './args/update-one-custom.args';

@Resolver(() => CustomEntity)
export class CustomResolver {
  @Query(() => [CustomEntity])
  findManyCustom(@Args() args: FindManyCustomArgs): CustomEntity[] {
    return [];
  }

  @Query(() => CustomEntity)
  findUniqueCustom(@Args() args: FindUniqueCustomArgs): CustomEntity {
    return {
      id: 'exampleId',
      data: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  @Query(() => CustomEntity)
  updateOneCustom(@Args() args: UpdateOneCustomArgs): CustomEntity {
    return {
      id: 'exampleId',
      data: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  @Query(() => CustomEntity)
  deleteOneCustom(@Args() args: UpdateOneCustomArgs): CustomEntity {
    return {
      id: 'exampleId',
      data: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
