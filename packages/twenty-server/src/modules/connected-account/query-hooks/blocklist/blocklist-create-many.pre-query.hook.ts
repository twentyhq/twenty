import { Injectable } from '@nestjs/common';

import z from 'zod';

import { WorkspacePreQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/interfaces/workspace-pre-query-hook.interface';
import { CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { isDomain } from 'src/engine/utils/is-domain';
import { BlocklistObjectMetadata } from 'src/modules/connected-account/standard-objects/blocklist.object-metadata';

@Injectable()
export class BlocklistCreateManyPreQueryHook implements WorkspacePreQueryHook {
  constructor() {}

  async execute(
    userId: string,
    workspaceId: string,
    payload: CreateManyResolverArgs<
      Omit<BlocklistObjectMetadata, 'createdAt' | 'updatedAt'> & {
        createdAt: string;
        updatedAt: string;
      }
    >,
  ): Promise<void> {
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

    for (const { handle } of payload.data) {
      if (!handle) {
        throw new Error('Handle is required');
      }

      emailOrDomainSchema.parse(handle);
    }
  }
}
