import { Injectable } from '@nestjs/common';

import z from 'zod';

import { WorkspacePreQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/interfaces/workspace-pre-query-hook.interface';
import { CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { isDomain } from 'src/engine/utils/is-domain';

@Injectable()
export class BlocklistCreateOnePreQueryHook implements WorkspacePreQueryHook {
  constructor() {}

  async execute(
    userId: string,
    workspaceId: string,
    payload: CreateOneResolverArgs & { data: { handle: string } },
  ): Promise<void> {
    const { handle } = payload.data;

    if (!handle) {
      throw new Error('Handle is required');
    }

    const emailOrDomainSchema = z
      .string()
      .trim()
      .email('Invalid email or domain')
      .or(
        z
          .string()
          .refine(
            (value) => value.startsWith('@') && isDomain(value.slice(1)),
            'Invalid email or domain',
          ),
      );

    emailOrDomainSchema.parse(handle);
  }
}
