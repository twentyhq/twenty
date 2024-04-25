import { Injectable } from '@nestjs/common';

import z from 'zod';

import { WorkspacePreQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/interfaces/workspace-pre-query-hook.interface';

import { isDomain } from 'src/engine/utils/is-domain';

@Injectable()
export class BlocklistCreateManyPreQueryHook implements WorkspacePreQueryHook {
  constructor() {}

  async execute(
    userId: string,
    workspaceId: string,
    payload: any, //CreateManyResolverArgs<BlocklistObjectMetadata>,
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
