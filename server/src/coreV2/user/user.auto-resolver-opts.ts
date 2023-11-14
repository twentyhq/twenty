import { SortDirection } from '@ptc-org/nestjs-query-core';
import {
  AutoResolverOpts,
  ReadResolverOpts,
  PagingStrategies,
} from '@ptc-org/nestjs-query-graphql';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';

import { User } from './user.entity';

import { CreateUserInput } from './dtos/create-user.input';
import { UpdateUserInput } from './dtos/update-user.input';

export const userAutoResolverOpts: AutoResolverOpts<
  any,
  any,
  unknown,
  unknown,
  ReadResolverOpts<any>,
  PagingStrategies
>[] = [
  {
    EntityClass: User,
    DTOClass: User,
    CreateDTOClass: CreateUserInput,
    UpdateDTOClass: UpdateUserInput,
    enableTotalCount: true,
    pagingStrategy: PagingStrategies.CURSOR,
    read: {
      defaultSort: [{ field: 'id', direction: SortDirection.DESC }],
    },
    create: {
      many: { disabled: true },
    },
    update: {
      many: { disabled: true },
    },
    delete: { many: { disabled: true }, one: { disabled: true } },
    guards: [JwtAuthGuard],
  },
];
