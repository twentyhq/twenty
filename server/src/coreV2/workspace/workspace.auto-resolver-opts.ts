import {
  AutoResolverOpts,
  PagingStrategies,
  ReadResolverOpts,
} from '@ptc-org/nestjs-query-graphql';
import { SortDirection } from '@ptc-org/nestjs-query-core';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { UpdateWorkspaceInput } from 'src/coreV2/workspace/dtos/update-workspace-input';

import { Workspace } from './workspace.entity';

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
    UpdateDTOClass: UpdateWorkspaceInput,
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
    },
    delete: { many: { disabled: true }, one: { disabled: true } },
    guards: [JwtAuthGuard],
  },
];
