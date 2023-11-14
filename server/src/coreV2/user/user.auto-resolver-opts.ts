import { SortDirection } from '@ptc-org/nestjs-query-core';
import {
  AutoResolverOpts,
  ReadResolverOpts,
  PagingStrategies,
} from '@ptc-org/nestjs-query-graphql';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';

import { User } from './user.entity';

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
    enableTotalCount: true,
    pagingStrategy: PagingStrategies.CURSOR,
    read: {
      defaultSort: [{ field: 'id', direction: SortDirection.DESC }],
    },
    create: {
      many: { disabled: true },
      one: { disabled: true },
    },
    update: {
      many: { disabled: true },
      one: { disabled: true },
    },
    delete: { many: { disabled: true }, one: { disabled: true } },
    guards: [JwtAuthGuard],
  },
];
