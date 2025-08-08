import { Injectable, UnauthorizedException } from '@nestjs/common';

import {
  type BeforeCreateOneHook,
  type CreateOneInputType,
} from '@ptc-org/nestjs-query-graphql';

import { type CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';

@Injectable()
export class BeforeCreateOneObject<T extends CreateObjectInput>
  implements BeforeCreateOneHook<T>
{
  async run(
    instance: CreateOneInputType<T>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: any,
  ): Promise<CreateOneInputType<T>> {
    const workspaceId = context?.req?.workspace?.id;

    if (!workspaceId) {
      throw new UnauthorizedException();
    }

    instance.input.workspaceId = workspaceId;

    return instance;
  }
}
