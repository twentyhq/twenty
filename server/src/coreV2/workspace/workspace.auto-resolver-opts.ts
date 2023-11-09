import {
  AutoResolverOpts,
  PagingStrategies,
  ReadResolverOpts,
} from '@ptc-org/nestjs-query-graphql';
import { SortDirection } from '@ptc-org/nestjs-query-core';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';

import { Workspace } from './workspace.entity';

import { CreateWorkspaceInput } from './dtos/create-workspace.input';

export const workspaceAutoResolverOpts: AutoResolverOpts<
  any,
  any,
  unknown,
  unknown,
  ReadResolverOpts<any>,
  PagingStrategies
>[] = [
  {
    EntityClass: Workspace,
    DTOClass: Workspace,
    CreateDTOClass: CreateWorkspaceInput,
    UpdateDTOClass: CreateWorkspaceInput,
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
    delete: { many: { disabled: true } },
    guards: [JwtAuthGuard],
  },
];
